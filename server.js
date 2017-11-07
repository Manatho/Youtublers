
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
        videos: [
            { user: 'John Doe', name: 'Magical Joe', views: Math.floor(Math.random() * 200), uploaded: new Date(2012,0,1) },
            { user: 'Jack Sparrow', name: 'Why is the rum gone', views: Math.floor(Math.random() * 200), uploaded: new Date(2012,0,1) },
            { user: 'Bond, James Bond', name: 'Best theme song', views: Math.floor(Math.random() * 200), uploaded: new Date(2012,0,1) },
            { user: 'Rick Sanchez', name: 'Adventure time', views: Math.floor(Math.random() * 200), uploaded: new Date(2012,0,1) },]
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