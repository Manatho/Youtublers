
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

var app = new TinyRouter();

app.get('/home', function(request){
    return showPage('./pages/home.html', {'Fisk': 'FUCKING OP'});
});


function showPage(path, vars){
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file; 

}



app.listen(8080);