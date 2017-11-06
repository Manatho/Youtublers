
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

var app = new TinyRouter();

app.get('/home', function(request){
    return showPage('./pages/home.html', {
        'Fisk': 'FUCKING OP',
        people: [
            {name: 'John Doe', age: Math.floor(Math.random() * 60), hobbies: ['climbing', 'skiing'] },
            {name: 'Jack Sparrow', age: Math.floor(Math.random() * 60) },
            {name: 'Bond, James Bond', age: Math.floor(Math.random() * 60) },
            {name: 'Rick Sanchez', age: Math.floor(Math.random() * 60) },
        ]
    });
});

function showPage(path, vars){
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file; 

}



app.listen(8080);