var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');

class HtmlPreprocessor {

    /*
        @html: html page as a string
        @replaceTagWith: Associative array
            key: tag
            value: replacement text
        @return string containing the changed html

        In html replaces the tag <var>tag</var> with the replacement text
    */
    static variableInjection(html, inputVariables) {
        var $ = cheerio.load(html);

        $('var').each((index,element) => {
                var temp = HtmlPreprocessor.getNestedValue(inputVariables, $(element).html());
                $(element).replaceWith(temp.toString());
        });
        
        return $.html();
    }


    /*
        @html: html page as a string
        @return string containing the changed html

        Replaces <import file="filename"></import> with the text files content

    */
    static fileInjection(html) {
        var $ = cheerio.load(html);

        $('import').each((index,element) =>{
            var fileName = element.attribs.file;
            if(fs.existsSync(fileName))
            {
                var file = fs.readFileSync(fileName);
                $(element).replaceWith(file.toString());
            }
            else
            throw("File: '" + fileName + "' not found!")

        })

        return $.html();
    }

    static foreachInjection(html, inputVariables){
        var $ = cheerio.load(html);
        // console.log($('foreach').attr('key'));


        $('foreach').filter(
            function(i, el) {
                return $(this).parents().filter('foreach').length == 0;
              }
        ).each((index, element) => {
            var key = element.attribs.key;
            var list = HtmlPreprocessor.getNestedValue(inputVariables, element.attribs.in);
            var tag = element.attribs.tag;

            var newElement = $('<'+tag+'><'+tag+'/>');

            if(list != undefined){
                var children = $(element).html();
                
                list.forEach((item) => {
                    var loopList = {};
                    loopList[key] = item;
                    newElement.append(HtmlPreprocessor.variableInjection(HtmlPreprocessor.foreachInjection(children, loopList), loopList));
                });
            }

            $(element).replaceWith(newElement);
        });

        return $.html();
    }

    static getNestedValue(obj, key) {
        return key.split(".").reduce(function(result, key) {
           return result[key] 
        }, obj);
    }
    
    static process(html, inputVariables) {
        html = HtmlPreprocessor.fileInjection(html);
        html = HtmlPreprocessor.foreachInjection(html, inputVariables);
        html = HtmlPreprocessor.variableInjection(html, inputVariables);
        return html;
    }
}
module.exports = HtmlPreprocessor;


