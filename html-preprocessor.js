var http = require('http');
var fs = require('fs');

class HtmlPreprocessor {

    /*
        @html: html page as a string
        @replaceTagWith: Associative array
            key: tag
            value: replacement text
        @return string containing the changed html

        In html replaces strings of the form, {{tag}} with replacement text
    */
    static variableInjection(html, replaceTagWith) {
        for (var key in replaceTagWith) {
            var replacementRegex = "({){2}" + key + "(}){2}";
            var reg = RegExp(replacementRegex, 'g');
            html = html.replace(reg, replaceTagWith[key]);
        }
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
            console.log("Hey!");
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
    
    static process(html, replaceTagWith) {
        html = HtmlPreprocessor.fileInjection(html);
        html = HtmlPreprocessor.variableInjection(html, replaceTagWith);
        return html;
    }
}
module.exports = HtmlPreprocessor;


