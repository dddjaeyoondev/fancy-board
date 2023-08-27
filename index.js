const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT)");
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/board', (req, res) => {
  db.all("SELECT * FROM posts", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error retrieving posts.");
    }
    res.render('board', { posts: rows });
  });
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.post('/create', (req, res) => {
  const { title, content } = req.body;

  db.run("INSERT INTO posts (title, content) VALUES (?, ?)", [title, content], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error creating post.");
    }
    res.redirect('/board');
  });
});

app.get('/delete/:id', (req, res) => {
  const postId = req.params.id;

  db.run("DELETE FROM posts WHERE id = ?", [postId], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error deleting post.");
    }
    res.redirect('/board');
  });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});
