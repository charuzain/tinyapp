const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortuRL = generateRandomString();
  urlDatabase[shortuRL] = req.body.longURL;
  res.redirect(`/urls/${shortuRL}`);

});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL  = urlDatabase[shortURL];
  res.redirect(longURL);

});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});