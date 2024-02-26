const sqlite = require("sqlite3").verbose(),
  path = require("path");

const db = new sqlite.Database(path.join(__dirname, "db.sqlite"), (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});
db.serialize(() => {
db.run(
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, limite INT, saldo INT)",
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("users table created.");
    }
  }
);
db.run("INSERT INTO users (limite, saldo) VALUES (100000, 0)")
db.run("INSERT INTO users (limite, saldo) VALUES (80000, 0)")
db.run("INSERT INTO users (limite, saldo) VALUES (1000000, 0)")
db.run("INSERT INTO users (limite, saldo) VALUES (10000000, 0)")
db.run("INSERT INTO users (limite, saldo) VALUES (500000, 0)")

});