var sha1 = require('sha1');
var fs = require('fs');

class Session{

    static set(request, property, value){
        var session = Session.load(request);
        session[property] = value;
        Session.save(request, session);
    }

    static get(request, property){
        return Session.load(request)[property];
    }

    static load(request){
        var filepath = './sessions/'+sha1(request.connection.remoteAddress);
        return JSON.parse(fs.readFileSync(filepath));
    }

    static save(request, changedSession){
        var filepath = './sessions/'+sha1(request.connection.remoteAddress);
        fs.writeFileSync(filepath, JSON.stringify(changedSession));
    }

    static checkFile(request){
        
        if(!fs.existsSync('./sessions/')) fs.mkdirSync('./sessions/');

        var filepath = './sessions/'+sha1(request.connection.remoteAddress);
        if(fs.existsSync(filepath)){

        }else{
            console.log('session not found for ip:', request.connection.remoteAddress, ', creating...');
            var file = fs.openSync(filepath, 'w');
            fs.writeSync(file, JSON.stringify({address: request.connection.remoteAddress}));
            fs.closeSync(file);
        }
    }

    static clear(request){
        Session.save(request, {});
    }

    static clearAll(){
        
        var folder = './sessions/';

        if(!fs.existsSync(folder)) fs.mkdirSync(folder);
        
        var files = fs.readdirSync(folder);

        for(let file of files){
            fs.unlinkSync(folder+file);
        }
        
    }

}

module.exports = Session;