
var DB = require('./database.js');
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

DB.initialize();

var app = new TinyRouter();

app.get('/home', (request) => {
    return showPage('./pages/home.html', {
        'Fisk': 'FUCKING OP',
        people: [
            {name: 'John Doe', age: Math.floor(Math.random() * 60), hobbies: ['climbing', 'skiing'] },
            {name: 'Jack Sparrow', age: Math.floor(Math.random() * 60), hobbies: ['pirating', 'rum'] },
            {name: 'Bond, James Bond', age: Math.floor(Math.random() * 60), hobbies: ['martini', 'shaken'] },
            {name: 'Rick Sanchez', age: Math.floor(Math.random() * 60), hobbies: ['himself', 'not life'] },
        ],
        videos: DB.videos()
    });
});

app.get('/createTestVideo', (request, params) => {
    var id = DB.createVideo(params.title, params.description);
    return showPage('./pages/debug.html', {debug: 'Created video:\tid:' + id + '\ttitle:' + params.title + '\tdescription:' + params.description});
});

function showPage(path, vars){
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file; 

}

app.listen(8080);