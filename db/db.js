import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./db/db.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, limite INT, saldo INT)",
    (err) => {
      if (err) {
        console.error(err.message);
        db.run("DROP TABLE users");
      } else {
        console.log("Users table created.");
        // db.run("INSERT INTO users (id,limite, saldo) VALUES (1, 100000, 0)");
        // db.run("INSERT INTO users (id,limite, saldo) VALUES (2, 80000, 0)");
        // db.run("INSERT INTO users (id,limite, saldo) VALUES (3, 1000000, 0)");
        // db.run("INSERT INTO users (id,limite, saldo) VALUES (4, 10000000, 0)");
        // db.run("INSERT INTO users (id,limite, saldo) VALUES (5, 500000, 0)");
        // console.log("Data inserted.");
      }
    }
  );
});

export function getUser(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (!row) {
          reject("User not found");
        }
        resolve(row);
      }
    });
  });
}

export function setBalance(id, saldo) {
  db.run("UPDATE users SET saldo = ? WHERE id = ?", [saldo, id], (err) => {
    if (err) {
      console.error(err.message);
    }
  });
}

export default { getUser, setBalance };
