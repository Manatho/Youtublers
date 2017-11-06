const sqlite3 = require('sqlite3').verbose();
const shortid = require('shortid');

const db = new sqlite3.Database('./db/youtublers.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

class DB{

    static initialize(){
        db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username varchar(50) NOT NULL UNIQUE,
            password varchar(255) NOT NULL
            );
        `);
        db.run(`
        CREATE TABLE IF NOT EXISTS videos (
            id varchar(8) NOT NULL PRIMARY KEY,
            title varchar(50) NOT NULL,
            description varchar(255) NOT NULL,
            user_id INTEGER NOT NULL
            );
        `);
    }

    static users(){
        var array = [];
        db.each('SELECT * FROM users', (err, row) => {
            array.push(row);
        });
        return array;
    }

    static createUser(username, password){
        var stmt = db.prepare("INSERT INTO users VALUES (?, ?)");
        stmt.run(username, password);
        stmt.finalize();
        return id;
    }

    static videos(){
        var vids = [];
        db.all('SELECT * FROM videos', (err, rows) => {
            return rows;
        });
    }

    static createVideo(title, description){
        var id = shortid.generate();
        db.serialize(() => {
            var stmt = db.prepare("INSERT INTO videos VALUES (?, ?, ?)");
            stmt.run(id, title, description);
            stmt.finalize();
        });
        return id;
    }

    

    static close(){
        db.close();
    }

}

module.exports = DB;