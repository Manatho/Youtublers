let TinyRouter = require('./tiny-router.js');
var http = require('http');
var fs = require('fs');

var app = new TinyRouter();

app.get('/home', function(request){
    return "HOMEPAGE";
});

app.get('/lol', function(request){
    return showPage('./pages/home.html');
});


function showPage(path){
    return fs.readFileSync(path);
    return result;
}



app.listen(8080);