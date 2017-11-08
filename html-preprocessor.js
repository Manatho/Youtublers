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

        In html replaces strings of the form, {{tag}} with replacement text
    */
    static variableInjection(html, inputVariables) {
        var reg = /{{+([\w\d]+(\.?))+}}/g;
        var matches = html.match(reg);

        if(matches != null)
        for(let i = 0; i < matches.length; i++){
            var key = matches[i];
            html = html.replace(key, HtmlPreprocessor.getNestedValue(inputVariables, key.replace('{{', '').replace('}}', '')));
        }

        // }
        return html;
    }


    /*
        @html: html page as a string
        @return string containing the changed html

        Injects 

    */
    static fileInjection(html) {
        var reg = /@include\([^) ]+\)/g;
        while (true) {
            var match = reg.exec(html);
            if (match != null)
            {
                var fileName =match[0].slice(9,match[0].length-1);
                if(fs.existsSync(fileName))
                {
                    var file = fs.readFileSync(fileName);
                    html = html.replace(match[0], file);
                }
                else
                    throw("File: '" + fileName + "' not found!")
            }
            else
                break;
        }
        return html;
    }

    /*
        @html: html page as a string
        @inputVariables: Associative array
            key: tag
            value: replacement text
        @return string containing the changed html

        Parses html and repeats everything within <foreach></foreach> tags
    */
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

    /*
        
    */
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


