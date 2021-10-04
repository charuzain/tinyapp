const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
//-------------------------------------------------------------------------------
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['8h8@349!*rh', '9h64@*!hi#*&']
}));

//-------------------Helper function Module--------------------------------------
const {
  generateRandomString,
  findUserByEmail,
  createUser,
  urlsForUser
} = require("./helpers");


//---------------------Database Set Up ------------------------------------------
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//------------------Home page - Redirect to /urls or /login page----------------
app.get('/',(req,res)=>{
 const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (!loggedInUser) {
    res.redirect('/login');
  }
  else{
    res.redirect('/urls');
  }
});

//------------------List all the URls--------------------------------------------
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (!loggedInUser) {
    return res.status(400).send('You are not logged In please <a href ="/login">Login First</a>');
  }
  const loggedInUserURL = urlsForUser(userId,urlDatabase);
  const templateVars = {
    user: loggedInUser,
    urls: loggedInUserURL
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (loggedInUser) {
    const shortuRL = generateRandomString();
    urlDatabase[shortuRL] = {
      "longURL":req.body.longURL,
      "userID":userId
    };
    res.redirect(`/urls/${shortuRL}`);
  } else {
    return res.status(402).send('User not logged In');
  }
});

//-------------------Display the add URls page-----------------------------------
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = {
    user: loggedInUser,
  };

  if (!loggedInUser) {
    return res.redirect('/login');
  }
  res.render("urls_new",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const shortURLKey = urlDatabase[shortURL];
  if (!shortURLKey) {
    return res.status(406).send('Short URL not found. Go to url list from <a href="/urls">here</a>');
  }
  res.redirect(urlDatabase[shortURL].longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const shortURL = req.params.shortURL;
  const shortURLKey = urlDatabase[shortURL];
  if(!userId)
  {
    return res.status(400).send('You are not logged In please <a href ="/login">Login First</a>');
  }

  if (!shortURLKey) {
    return res.status(406).send('Short URL not found. Go to urls list from <a href="/urls">here</a>');
  }
  if ( userId !== urlDatabase[shortURL].userID) {
    return res.status(501).send('You are not authorized to access the url. Create new url <a href="/urls/new">here</a>');
  }
  const templateVars = {
    user: loggedInUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

//--------------------Route to delete url -----------------------------------------
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const shortURLKey = urlDatabase[shortURL];
  if(!userId)
  {
    return res.status(400).send('You are not logged In please <a href ="/login">Login First</a>');
  }
  if ( userId !== urlDatabase[shortURL].userID) {
    return res.status(501).send('You are not autherized to access the url. Go to urls list from <a href="/urls">here</a>');
  }
  if (!shortURLKey) {
    return res.status(406).send('Short URL not found. Go to urls list from <a href="/urls">here</a>');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//-------------------Route to update url-----------------------------------------
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newURL;
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  if (!userId) {
    return res.status(400).send('You are not logged in, please <a href ="/login">Login First</a>');
  }
  if (!urlDatabase[shortURL]) {
    return res.status(502).send('URL Not Found');
  }
  if ( userId !== urlDatabase[shortURL].userID) {
    return res.status(501).send('You are not autherized to update the link');
  }
 
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');

});

//-------------------Login Page--------------------------------------------------
app.get('/login',(req,res)=>{
  const templateVars = { user: null };
  const userId = req.session.user_id;
  if(userId)
  {
    res.redirect('/urls');
  }
  res.render('login', templateVars);
});
//-------------------Login Route-------------------------------------------------
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
 // ensure user has entered credentials
  if (!email || !password) {
    return res.status(403).send('Enter Details');
  }
  const userFound = findUserByEmail(email, users);
//
  if (!userFound) {
    return res.status(401).send('User not found');
  }

// if a registered email id is found and password entered is correct
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    req.session.user_id = userFound.id;
    res.redirect('/urls');
    return;
  }
 // If email id is found but password entered is incorrect 
   res.status(403).send('Wrong Password');
});

//-------------------Logout Route-----------------------------------------------
app.post('/logout',(req,res)=>{
  req.session = null;
  res.redirect('/urls');
});

//-------------------New user registration Route--------------------------------
app.get('/register',(req,res)=>{
  const templateVars = { user: null};
  const userId = req.session.user_id;

  if(userId)
  {
    res.redirect('/urls');
  }
  res.render('user_register', templateVars);
});

app.post('/register',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Enter Details');
  }
  const userFound = findUserByEmail(email , users);
  if (userFound) {
    return res.status(400).send('User already exists!!Please <a href ="/login">Login</a>');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = createUser(email , hashedPassword , users);
  req.session.user_id = userId;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});