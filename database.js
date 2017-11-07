const sql = require('sqlite-sync');
const shortid = require('shortid');

const dbfile = './db/youtublers.db';

class DB{

    static initialize(){
        sql.connect(dbfile);
        sql.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username varchar(50) NOT NULL UNIQUE,
            password varchar(255) NOT NULL
            );
        `);
        sql.run(`
        CREATE TABLE IF NOT EXISTS videos (
            id varchar(8) NOT NULL PRIMARY KEY,
            title varchar(50) NOT NULL,
            description varchar(255) NOT NULL,
            user_id INTEGER NOT NULL
            );
        `);
        sql.close();
    }

    static users(){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM users');
        sql.close();
        return rows;
    }

    static createUser(username, password){
        sql.connect(dbfile);
        sql.run("INSERT INTO users VALUES (?, ?)", [username, password]);
        sql.close();
    }

    static videos(){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM videos');
        sql.close();
        return rows;
    }

    static createVideo(title, description){
        var id = shortid.generate();
        sql.connect(dbfile);
        sql.run("INSERT INTO videos VALUES (?, ?, ?)", [id, title, description]);
        sql.close();
        return id;
    }

}

module.exports = DB;