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
            parent_comment INTEGER,
            video_id varchar(8) NOT NULL,
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
        CREATE TABLE IF NOT EXISTS views (
            user_id integer NOT NULL,
            video_id varchar(8) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, video_id)
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

    static ValidateUser(username, password){
        sql.connect(dbfile);
        var result = sql.run('SELECT * FROM users WHERE ? = username AND ? = password', [username, password]).length == 1;
        
        sql.close();
        return result;
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

    static videosByTitle(title){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM videos WHERE title LIKE ?', ['%'+title+'%']);
        sql.close();
        return rows;
    }

    static videoByID(id){
        sql.connect(dbfile);
        var rows = sql.run('SELECT * FROM videos WHERE id = ? LIMIT 1', [id]);
        sql.close();
        var video = rows[0];
        return video;
    }

    static createVideo(title, description, user_id){
        var id = shortid.generate();
        sql.connect(dbfile);
        sql.run("INSERT INTO videos (id, title, description, user_id) VALUES (?, ?, ?, ?)", [id, title, description, user_id]);
        sql.close();
        return id;
    }

    static comments(video_id){
        sql.connect(dbfile);
        var rows = sql.run(`SELECT c.user_id, ifnull(u.username, 'Unkown user') as username, c.content, c.created_at FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.video_id = ? AND c.parent_comment IS NULL`, [video_id]);
        sql.close();
        return rows;
    }

    static createComment(user_id, content, video_id, parent_comment = undefined){
        sql.connect(dbfile);
        if(parent_comment != undefined){
            sql.run("INSERT INTO comments(user_id, content, video_id, parent_comment) VALUES (?, ?, ?, ?)", [user_id, content, video_id, parent_comment]);
        }else{
            sql.run("INSERT INTO comments(user_id, content, video_id) VALUES (?, ?, ?)", [user_id, content, video_id]);
        }
        sql.close();
    }

    static rating(video_id){
        sql.connect(dbfile);
        var rating = sql.run('SELECT SUM(rating) as total from ratings WHERE video_id = ?', [video_id]);
        sql.close();
        return rating.total == undefined ? 0 : rating.total;
    }

    static createRating(user_id, video_id, rating){
        sql.connect(dbfile);
        sql.run("INSERT INTO ratings VALUES (?, ?, ?)", [user_id, video_id, rating]);
        sql.close();
    }

    static tables(){
        sql.connect(dbfile);
        var tables = sql.run("SELECT name FROM sqlite_master WHERE type='table';");
        sql.close();
        return tables;
    }

}

module.exports = DB;