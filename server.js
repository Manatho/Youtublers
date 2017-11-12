var Session = require('./session.js');
var DB = require('./database.js');
var HtmlPreprocessor = require('./html-preprocessor.js');
let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');
var sha = require('sha1');

DB.initialize();

var app = new TinyRouter();

app.get('/', (request) => {
    return showPage('./pages/home.html', {
        searchTitle: 'Most viewed',
        videos: DB.videos(),
        user: Session.get(request, 'user_id') != undefined
    });
});

app.get('/home', (request) => {
    return showPage('./pages/home.html', {
        searchTitle: 'Most viewed',
        videos: DB.videos(),
        user: Session.get(request, 'user_id') != undefined
    });
});

app.get('/results', (request, params) => {
    return showPage('./pages/search.html', {
        searchTitle: 'Search results',
        videos: DB.videosByTitle(params.search),
        user: Session.get(request, 'user_id') != undefined

    });
});


app.get('/watch', (request, params) => {

    if (params.v == undefined) return 'invalid request';

    var video = DB.videoByID(params.v);
    var comments = DB.comments(params.v);
    var rating = DB.rating(params.v).total;

    if(typeof(rating) != 'number') rating = 0;

    if(video != undefined){
        return showPage('./pages/watch.html', {
            video: video,
            comments: comments,
            rating: rating,
            user: Session.get(request, 'user_id') != undefined
        });
    }
    return 'potato request';
});

app.post('/comment', (request, fields) => {

    if(!checkLogin(request)) return JSON.stringify({status: 'unauthenticated'});

    var video = DB.videoByID(fields['video']);
    var comment = fields['comment'];
    
    if(video == undefined || comment == undefined || comment.length > 512 || comment.length == 0) return JSON.stringify({status: 'error', message: 'invalid input'});

    DB.createComment(Session.get(request, 'user_id'), comment, video.id);
    return JSON.stringify({status: 'success', comment: DB.comments(video.id).slice(-1)[0]});
});

app.post('/rating', (request, fields) => {

    if(!checkLogin(request)) return JSON.stringify({status: 'unauthenticated'});

    var video = DB.videoByID(fields['video']);
    var rating = Math.min(Math.max(fields['rating'], -1), 1);

    if(video == undefined) return JSON.stringify({status: 'error', message: 'video not found'});

    DB.createRating(Session.get(request, 'user_id'), video.id, rating);

    var newRating = DB.rating(video.id).total;

    return JSON.stringify({status: 'success', newRating: newRating});
});

app.get('/sessionTester', (request, params) => {
    return showPage('./pages/debug.html', { debug: JSON.stringify(Session.load(request)) });
})

app.get('/upload', (request, params) => {
    if(Session.get(request, 'user_id') != undefined)
        return showPage('./pages/upload.html', {user: Session.get(request, 'user_id') != undefined});
    
    return showPage('./pages/403.html', {});

})

app.get('/login', (request, params) => {

    return showPage('./pages/login.html', {});
});

app.get('/createuser', (request, params) => {
    
        return showPage('./pages/createuser.html', {});
    });

app.post('/upload', (request, fields, files) => {


    if(!checkLogin(request)) return JSON.stringify({status: 'unauthenticated'});

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

    var user = DB.ValidateUser(username, password);

    if (user) {
        Session.set(request, 'user_id', user.id);
        return JSON.stringify({ status: 'success', message: 'You are now logged in, redirecting...'});
    }
    else
        return JSON.stringify({ status: 'error', message: 'Invalid password or username' });


});

app.post('/createuser', (request, fields, files) => {
    
    var username = fields['username'];
    var password = sha(fields['password']);

    DB.createUser(username, password);
    return JSON.stringify({ status: 'success' });
});

function checkLogin(request){
    return (Session.get(request, 'user_id') != undefined);
}

function showPage(path, vars) {
    var file = fs.readFileSync(path);
    file = file.toString();
    file = HtmlPreprocessor.process(file, vars);
    return file;

}

Session.clearAll();
app.listen(8080);