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
    static variableInjection(html, inputVariables) {
        var reg = /{{+([\w\d]+(\.?))+}}/g;
        var matches = html.match(reg);

        console.log(matches);

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

    static foreachInjection(html, inputVariables){
        var reg = /@foreach\([^)]+\)/g;
        var match = reg.exec(html);
        console.log(match);
        while(match != null){
            var innerText = match[0].slice(9,match[0].length-1);
            var params = innerText.split(" ");
            var tag = params[0];
            var list = params[params.length-1];

            var innerhtml = html.slice(match.index+match[0].length, HtmlPreprocessor.getClosingTag(html, match.index) + match.index + 1);

            var newhtml = "";
            inputVariables[list].forEach(function(element) {
                var input = {};
                input[tag] = element;
                // console.log(innerhtml, input);
                newhtml += HtmlPreprocessor.variableInjection(innerhtml, input);
            }, this);
            
            // console.log(newhtml);
            html = html.replace(innerhtml, newhtml);

            match = reg.exec(html);
        }

        return html;
    }

    static getIndicesOf(searchStr, str, caseSensitive) {
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;
        }
        return indices;
    }

    static getClosingTag(html, openPos) {
        var openTag = '@foreach(';
        var closingTag = '@endforeach';
        
        var counter = 1;
        var openTags = HtmlPreprocessor.getIndicesOf(openTag, html.substring(openPos+1), false); // openPos +1 because we've already counted the first opentag
        var closedTags = HtmlPreprocessor.getIndicesOf(closingTag, html.substring(openPos+1), false);
        var currentTagIndex = -1;
        while (counter > 0 && (openTags.length > 0 || closedTags.length > 0)) {
            
            var open  = openTags[0];
            if(open == undefined) open = html.length;
            var close = closedTags[0];
            if(close == undefined) close = html.length;

            // console.log('open', openTags, 'lowest', open, 'closed', closedTags, 'lowest', close, 'counter', counter);           

            if(openTags.length > 0 && open < close){
                openTags.splice(0,1);
                counter++;
            }
            if(closedTags.length > 0 && close < open){
                closedTags.splice(0,1)
                counter--;
            }
            
            currentTagIndex = close;

        }
        return currentTagIndex;
    }

    static getNestedValue(obj, key) {
        //console.log(obj, key);
        return key.split(".").reduce(function(result, key) {
           return result[key] 
        }, obj);
    }
    
    static process(html, inputVariables) {
        html = HtmlPreprocessor.foreachInjection(html, inputVariables);
        //html = HtmlPreprocessor.variableInjection(html, inputVariables);
        html = HtmlPreprocessor.fileInjection(html);
        return html;
    }
}
module.exports = HtmlPreprocessor;


