var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('mime');

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
            // console.log('[INFO]\t\''+req.pathname+'\' requested');
            if(router.getRoutes[req.pathname] != undefined){
                
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(router.getRoutes[req.pathname](request, req.query));
                response.end();
            }else{
                var filepath = './public'+req.pathname;                
                if(fs.existsSync(filepath)){
                    var type = mime.getType(filepath);
                    if (!response.getHeader('content-type')) {
                        response.setHeader('Content-Type', type);
                        response.write(fs.readFileSync(filepath));
                        response.end();
                    }
                }else{
                    response.writeHead(404, "Page or Resource not found. 404");
                    response.end();
                }
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