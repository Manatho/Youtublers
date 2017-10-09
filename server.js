const http = require('http')
let TinyRouter = require('./tiny-router.js');

var app = new TinyRouter();


app.get('/home', function(request){
    console.log("home requested!");
});

app.printRoutes();

app.listen(8080);