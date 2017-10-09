class TinyRouter{

    constructor(){
        console.log("TinyRouter Created");
        this.getRoutes = [];
        this.postRoutes = [];
    }

    listen(port){
        //TODO:
        //  Listen on port, and return the result of the correct function, depending on the request.
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