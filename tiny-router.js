var http = require('http');
var url = require('url');

class TinyRouter{

    constructor(){
        console.log("TinyRouter Created");
        this.getRoutes = [];
        this.postRoutes = [];
    }

    listen(port){

        var router = this;

        http.createServer(function(request, response){
            var req = url.parse(request.url, true);

            if(router.getRoutes[req.pathname] != undefined){
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(router.getRoutes[req.pathname](request));
                response.end();
                console.log('[INFO]\t\''+req.pathname+'\' requested');
            }


        }).listen(port);
    }

    get(route, handler) {
        this.getRoutes[route] = handler;
    }

    post(route, handler) {
        this.postRoutes[route] = handler;
    }

    printRoutes(){
        console.log('GET:');
        console.log(this.getRoutes);
        console.log('-------------------------------');
        console.log('POST:');
        console.log(this.postRoutes);
    }

}

module.exports = TinyRouter;