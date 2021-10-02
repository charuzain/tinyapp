const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

/*const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};*/

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};
app.get('/',(req,res)=>{

  res.redirect();
});

//helper function
const urlsForUser = function(id, urlDb) {
  let loggedInUserURL = {};
  for (let urlId in urlDb) {
    if (urlDb[urlId].userID === id) {
      loggedInUserURL[urlId] = urlDb[urlId];
    }
  }
  console.log(loggedInUserURL);
  return loggedInUserURL;


};
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  if (!loggedInUser) {
    return res.status(400).send('<a href ="/login">Login First</a>');
  }
  const loggedInUserURL = urlsForUser(userId,urlDatabase);
  const templateVars = {
    user: loggedInUser,
    urls: loggedInUserURL
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];

  const templateVars = {
    user: loggedInUser,
  };
  //console.log(userId);
  if (!loggedInUser) {
    return res.redirect('/login');
  }
  res.render("urls_new",templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  if (loggedInUser) {
    const shortuRL = generateRandomString();
    urlDatabase[shortuRL] = {
      "longURL":req.body.longURL,
      "userID":userId
    };
    console.log(urlDatabase);
    res.redirect(`/urls/${shortuRL}`);
  } else {
    return res.status(402).send('User not logged In');

  }


});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const shortURLKey = urlDatabase[shortURL];
  // const longURL = urlDatabase[shortURL].longURL;
  if (!shortURLKey) {
    return res.status(406).send('Short URL not found. Go to /urls from <a href="/urls">here</a>');
  }
  res.redirect(urlDatabase[shortURL].longURL);
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const shortURL = req.params.shortURL;
  const shortURLKey = urlDatabase[shortURL];
  if (!shortURLKey || urlDatabase[shortURL].userID !== userId) {
    return res.status(406).send('Short URL not found. Go to /urls from <a href="/urls">here</a>');
  }
  const templateVars = {
    user: loggedInUser,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

// Route to delete url
app.post('/urls/:shortURL/delete', (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const shortURL = req.params.shortURL;
  if (!userId || userId !== urlDatabase[shortURL].userID) {
    return res.status(501).send('UnAuthorized');
  }
  if (!urlDatabase[shortURL]) {
    return res.status(502).send('URL Not Found');
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Route to update url
app.post('/urls/:shortURL', (req, res) => {
  console.log(req.params.shortURL);
  console.log(req.body.newURL);
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newURL;
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  if (!userId || userId !== urlDatabase[shortURL].userID) {
    return res.status(501).send('UnAuthorized');
  }
  if (!urlDatabase[shortURL]) {
    return res.status(502).send('URL Not Found');
  }
  urlDatabase[shortURL].longURL = newLongURL;

  res.redirect('/urls');

});

// Login Route
app.post('/login', (req, res) => {
// pull the info off the body
  const email = req.body.email;
  const password = req.body.password;
  //look up the user
  if (!email || !password) {
    return res.status(403).send('Enter Details');
  }
  const userFound = findUserByEmail(email, users);

  if (!userFound) {
    return res.status(401).send('User not found');
  }

  if (userFound && userFound.password === password) {
  
    res.cookie('user_id', userFound.id);
    res.redirect('/urls');
    return;
  }

  res.status(403).send('Wrong Password');
/*
//let foundUser;

for(const userId in users){
const user = users[userId];
if(user.email===email){
  foundUser = user;
}
}

//if there's no user wuth the email send error
if(!foundUser)
{
 return res.status(401).send('User not found')
}
//compare the user password

if(foundUser.password !==password){
 return res.status(403).send('Incorrect Password');
}

res.cookie('user_id', req.body.user_id);
res.redirect('/urls');  */
});

// Logout Route
app.post('/logout',(req,res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Login Page
app.get('/login',(req,res)=>{
  const templateVars = { user: null };
  res.render('login', templateVars);
});

// New user registration
app.get('/register',(req,res)=>{
  const templateVars = { user: null};
  res.render('user_register', templateVars);
});
//helper function
const findUserByEmail = function(email , userDb) {
  for (let userId in userDb) {
    const user = userDb[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};
// helper function

const createUser = function(email , password , userDb) {
  const userId = generateRandomString();

  userDb[userId] = {
    id: userId,
    email:email,
    password:password
  };
  return userId;

};
// Registration Handler
app.post('/register',(req,res)=>{
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Enter Details');
  }

  const userFound = findUserByEmail(email , users);
  if (userFound) {
    return res.status(400).send("User already exists!!");
  }

  const userId = createUser(email , password , users);

  res.cookie('user_id',userId);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});