
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

var app = new TinyRouter();

app.get('/home', function(request){
    return showPage('./pages/home.html');
});


function showPage(path){
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.fileInjection(file);
    
    return file; 

    return result;
}



app.listen(8080);