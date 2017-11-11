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

app.post('/upload', (request, fields, files) => {
    var video = files['video'];
    var title = fields['title'];
    var description = fields['description'];

    if(video == undefined || video.type != 'video/mp4') return JSON.stringify({status: 'error', message: 'video incorrect format or missing!'});
    if( (title == undefined || title.length > 50) || (description == undefined || description.length > 255)) return JSON.stringify({status: 'error', message: 'title and description missing or too long'});
    fs.rename(video.path, './public/videos/'+DB.createVideo(title, description, 1)+'.mp4')

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