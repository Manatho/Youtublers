var Session = require('./session.js');
var DB = require('./database.js');
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');
var sha = require('sha1');

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


app.get('/watch', (request, params) => {

    if (params.v == undefined) return 'invalid request';

    var video = DB.videoByID(params.v);

    console.log(video);
    if (video != undefined) {
        return showPage('./pages/watch.html', {
            video: video
        });
    }
    return 'potato request';
});


app.get('/sessionTester', (request, params) => {
    return showPage('./pages/debug.html', { debug: JSON.stringify(Session.load(request)) });
})

app.get('/upload', (request, params) => {
    return showPage('./pages/upload.html', {});
})

app.get('/login', (request, params) => {

    return showPage('./pages/login.html', {});
});

app.post('/upload', (request, fields, files) => {

    var video = files['video'];
    var title = fields['title'];
    var description = fields['description'];

    if (video == undefined || video.type != 'video/mp4') return JSON.stringify({ status: 'error', message: 'video incorrect format or missing!' });
    if ((title == undefined || title.length > 50) || (description == undefined || description.length > 255)) return JSON.stringify({ status: 'error', message: 'title and description missing or too long' });

    var id = DB.createVideo(title, description, 1);

    fs.rename(video.path, './public/videos/' + id + '.mp4')

    return JSON.stringify({ status: 'success', video: id });
});

app.post('/login', (request, fields, files) => {
    var username = fields['username'];
    var password = sha(fields['password']);

    if (DB.ValidateUser(username, password)) {
        sessionStorage.setItem(request, username, 1);
        return JSON.stringify({ status: 'success', video: id });
    }
    else
        return JSON.stringify({ status: 'error', message: 'Invalid password or username' });


});

function showPage(path, vars) {
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file;

}

Session.clearAll();
app.listen(8080);