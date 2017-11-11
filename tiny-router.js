var Session = require('./session.js');
var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
var url = require('url');
var fs = require('fs');
var mime = require('mime');


class TinyRouter {

    constructor() {
        console.log("TinyRouter Created");
        this.getRoutes = [];
        this.postRoutes = [];
    }

    listen(port) {

        var router = this;

        http.createServer(function (request, response) {
            var req = url.parse(request.url, true);
            // console.log('[INFO]\t\''+req.pathname+'\' requested');
            Session.checkFile(request);


            if (request.method == "GET" && router.getRoutes[req.pathname.toLowerCase()] != undefined) {
                response.writeHead(200, { "Content-Type": "text/html" });
                response.write(router.getRoutes[req.pathname.toLowerCase()](request, req.query));
                response.end();
            } else if (request.method == "POST" && router.postRoutes[req.pathname.toLowerCase()] != undefined) {

                // parse a file upload 
                var form = new formidable.IncomingForm();
                form.uploadDir = __dirname + "/test";

                form.parse(request, function (err, fields, files) {
                    response.writeHead(200, { 'content-type': 'text/plain' });
                    response.write('received upload:\n\n');
                    response.end(util.inspect({ fields: fields, files: files }));
                });

            } else {
                var filepath = './public' + req.pathname;
                if (fs.existsSync(filepath)) {
                    var type = mime.getType(filepath);
                    if (!response.getHeader('content-type')) {
                        response.setHeader('Content-Type', type);
                        response.write(fs.readFileSync(filepath));
                        response.end();
                    }
                } else {
                    response.writeHead(404, "Page or Resource not found. 404");
                    response.end();
                }
            }


        }).listen(port);
    }

    get(route, handler) {
        this.getRoutes[route.toLowerCase()] = handler;
    }

    post(route, handler) {
        this.postRoutes[route.toLowerCase()] = handler;
    }

    printRoutes() {
        console.log('GET:');
        console.log(this.getRoutes);
        console.log('-------------------------------');
        console.log('POST:');
        console.log(this.postRoutes);
    }

}

module.exports = TinyRouter;