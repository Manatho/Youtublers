const sql = require('sqlite-sync');
const shortid = require('shortid');

const dbfile = './db/youtublers.db';

class DB{

    static initialize(){
        sql.connect(dbfile);
        sql.run(`
        CREATE TABLE IF NOT EXISTS users (
            id integer PRIMARY KEY AUTOINCREMENT,
            username varchar(50) NOT NULL UNIQUE,
            password varchar(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        sql.run(`
        CREATE TABLE IF NOT EXISTS videos (
            id varchar(8) NOT NULL PRIMARY KEY,
            title varchar(50) NOT NULL,
            description varchar(255) NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        sql.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id integer PRIMARY KEY AUTOINCREMENT,
            user_id integer NOT NULL,
            content varchar(512) NOT NULL,
            parent_comment INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        sql.run(`
        CREATE TABLE IF NOT EXISTS ratings (
            user_id integer NOT NULL,
            video_id varchar(8) NOT NULL,
            rating integer NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, video_id)
            );
        `);
        sql.run(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            user_id integer NOT NULL,
            subscription_user_id integer NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, subscription_user_id)
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

    static comments(video_id){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM comments WHERE video_id = ?', [video_id]);
        sql.close();
        return rows;
    }

    static createComment(title, description){
        var id = shortid.generate();
        sql.connect(dbfile);
        sql.run("INSERT INTO videos VALUES (?, ?, ?)", [id, title, description]);
        sql.close();
        return id;
    }

    static ratings(){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM ratings');
        sql.close();
        return rows;
    }

    static createRating(user_id, video_id, rating){
        sql.connect(dbfile);
        sql.run("INSERT INTO ratings VALUES (?, ?, ?)", [user_id, video_id, rating]);
        sql.close();
    }

    static subscriptions(){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM subscriptions');
        sql.close();
        return rows;
    }

    static createSubscription(user_id, video_id, rating){
        sql.connect(dbfile);
        sql.run("INSERT INTO subscriptions VALUES (?, ?)", [user_id, subscription_user_id]);
        sql.close();
    }

}

module.exports = DB;