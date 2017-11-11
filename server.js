var Session = require('./session.js');
var DB = require('./database.js');
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

DB.initialize();

var app = new TinyRouter();

app.get('/home', (request) => {
    return showPage('./pages/home.html', {
        searchTitle: 'Most viewed',
        Fisk: 'FUCKING OP',
        videos: DB.videos(),
        user: Session.get(request, 'user_id') != undefined
    });
});

app.get('/results', (request, params) => {
    return showPage('./pages/search.html', {
        searchTitle: 'Search results',
        videos: DB.videosByTitle(params.search)
    
    });
});


app.get('/createTestVideo', (request, params) => {
    var id = DB.createVideo(params.title, params.description);
    return showPage('./pages/debug.html', {debug: 'Created video:\tid:' + id + '\ttitle:' + params.title + '\tdescription:' + params.description});
});


app.get('/sessionTester', (request, params) => {
    return showPage('./pages/debug.html', {debug: JSON.stringify(Session.load(request))});
})

app.get('/login', (request, params) => {

    // THIS SHOULD !NOT! BE A GET REQUEST BUT A POST

    // some checks are obviously needed here,
    // as well as actually getting the corresponding ID.

    Session.set(request, 'user_id', 1);
    return JSON.stringify({status: 'success'});
});

function showPage(path, vars){
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file;

}

Session.clearAll();
app.listen(8080);