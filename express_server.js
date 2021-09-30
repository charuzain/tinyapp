const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function () {
  let randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  console.log(templateVars.username)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  }
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  const shortuRL = generateRandomString();
  urlDatabase[shortuRL] = req.body.longURL;
  res.redirect(`/urls/${shortuRL}`);

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  //console.log(longURL)
  res.redirect(longURL);

});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

// Route to delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log(req.params)
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

// Route to update url
app.post('/urls/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.body.newURL);
  const shortURL = req.params.id;
  const newLongURL = req.body.newURL;
  urlDatabase[shortURL] = newLongURL;

  res.redirect('/urls');

})

// Login Route
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

// Logout Route
app.post('/logout',(req,res)=>{
  res.clearCookie('username');
  res.redirect('/urls');
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});