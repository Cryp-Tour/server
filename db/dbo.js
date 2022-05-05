const sqlite3 = require('sqlite3');
const Promise = require('bluebird');

class DBO {
    constructor(dbFilePath) {
        this.db = new sqlite3.Database(dbFilePath, (err) => {
          if (err) {
            console.log('Could not connect to database', err);
          } else {
            console.log('Connected to database');
          }
        })

        this.#createDB();
    }

    #createDB(){
      this.#createTableUser()
      .then(() => this.#createTableLoginAttempts())
      .then(() => this.#createTableTour())
      .then(() => this.#createTableUserTours())
      .then(() => this.#createTableTourImage())
      .then(() => this.#createTableRating())
      .then(() => this.#createTableRatingImage())
      .catch((err) => {
        console.log('Error: ')
        console.log(JSON.stringify(err))});
    }

    #createTableUser(){
      const sql = `
      CREATE TABLE IF NOT EXISTS user (
        uID INTEGER NOT NULL PRIMARY KEY,
        firstName varchar(255) NOT NULL,
        surName varchar(255) NOT NULL,
        pwdHash varchar(255) NOT NULL,
        eMail varchar(255) NOT NULL,
        walletID varchar(255),
        userName varchar(255) UNIQUE NOT NULL
        )`;
      return this.run(sql);
    }

    #createTableLoginAttempts(){
      const sql = `
      CREATE TABLE IF NOT EXISTS loginAttempts (
        userID INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        PRIMARY KEY(userID, timestamp),
        FOREIGN KEY(userID) REFERENCES user(uID)
        )`;
      return this.run(sql);
    }

    #createTableTour(){
      const sql = `
      CREATE TABLE IF NOT EXISTS tour (
        tID INTEGER NOT NULL PRIMARY KEY,
        description TEXT,
        title varchar(255) NOT NULL,
        duration REAL,
        distance REAL,
        difficulty INTEGER,
        location varchar(255),
        creatorID INTEGER NOT NULL,
        tokenAddress varchar(255),
        bpoolAddress varchar(255),
        FOREIGN KEY(creatorID) REFERENCES user(uID)
        )`;
      return this.run(sql);
    }

    #createTableUserTours(){
      const sql = `
      CREATE TABLE IF NOT EXISTS userTours (
        tourID INTEGER NOT NULL,
        userID INTEGER NOT NULL,
        FOREIGN KEY(tourID) REFERENCES tour(tID),
        FOREIGN KEY(userID) REFERENCES user(uID),
        PRIMARY KEY (tourID, userID)
        )`;
      return this.run(sql);
    }

    #createTableTourImage(){
      const sql = `
      CREATE TABLE IF NOT EXISTS tourImage(
        tiID INTEGER NOT NULL PRIMARY KEY,
        tourID INTEGER NOT NULL,
        FOREIGN KEY(tourID) REFERENCES tour(tID)
        )`;
      return this.run(sql);
    }

    #createTableRating(){
      const sql = `
      CREATE TABLE IF NOT EXISTS rating(
        rid INTEGER NOT NULL PRIMARY KEY,
        description TEXT,
        rating INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        ownerID INTEGER NOT NULL,
        tourID INTEGER NOT NULL,
        FOREIGN KEY(tourID) REFERENCES tour(tID),
        FOREIGN KEY(ownerID) REFERENCES user(uID)
        )`;
      return this.run(sql);
    }

    #createTableRatingImage(){
      const sql = `
      CREATE TABLE IF NOT EXISTS ratingImage(
        riID INTEGER NOT NULL PRIMARY KEY,
        ratingID INTEGER NOT NULL,
        FOREIGN KEY(ratingID) REFERENCES rating(rID)
        )`;
      return this.run(sql);
    }

    //used for create, alter, delete, update instructions
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function (err) {
            if (err) {
              console.log('Error running sql ' + sql);
              console.log(err);
              reject(err);
            } else {
              resolve({ id: this.lastID, changes: this.changes });
            }
          })
        })
    }

    //used to get multiple entries back from select
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
            if (err) {
                console.log('Error running sql: ' + sql);
                console.log(err);
                reject(err);
            } else {
                resolve(rows);
            }
            })
        });
    }
};

module.exports = DBO;
