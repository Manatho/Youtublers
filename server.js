
var DB = require('./database.js');
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

DB.initialize();
console.log("Database structure:\n",DB.videos());

var app = new TinyRouter();

app.get('/home', (request) => {
    return showPage('./pages/home.html', {
        searchTitle: 'Most viewed',
        Fisk: 'FUCKING OP',
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