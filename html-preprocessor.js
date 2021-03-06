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

        var reg = /{{+([\w\d]+(\.?))+}}/g; 
        var matches = html.match(reg); 
 
        if(matches != null) 
        for(let i = 0; i < matches.length; i++){ 
            var key = matches[i]; 
            html = html.replace(key, HtmlPreprocessor.getNestedValue(inputVariables, key.replace('{{', '').replace('}}', ''))); 
        } 
 
        var $ = cheerio.load(html);

        $('var').each((index,element) => {
                var temp = HtmlPreprocessor.getNestedValue(inputVariables, $(element).html());
                if(temp != undefined) $(element).replaceWith(temp.toString());
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

        
        while($('import').length !== 0)
        {
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
        }
        return $.html();
    }


    /*
        @html: html page as a string
        @replaceTagWith: Associative array
            key: tag
            value: replacement text
        @return string containing the changed html

        In html replaces the tag <var>tag</var> with the replacement text
    */
    static conditionalInjection(html, inputVariables) {
        var $ = cheerio.load(html);

        $('if').each((index,element) => {
            var content = $(element).html();
            var temp = $(element).attr('condition');
            var condition = true;

            if(temp.charAt(0) == "!")
            {
                condition = false;
                condition = !HtmlPreprocessor.getNestedValue(inputVariables, temp.substring(1));
            }
            else
            {
                condition = HtmlPreprocessor.getNestedValue(inputVariables, temp);
            }

            if(!condition){
                $(element).replaceWith('');
            }else{
                $(element).replaceWith(content);
            }
        });
        
        return $.html();
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
        html = HtmlPreprocessor.conditionalInjection(html, inputVariables);
        html = HtmlPreprocessor.foreachInjection(html, inputVariables);
        html = HtmlPreprocessor.variableInjection(html, inputVariables);
        return html;
    }
}
module.exports = HtmlPreprocessor;


