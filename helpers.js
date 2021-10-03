// Helper Functions ------------------------------------------------

// look up user by their email id
const findUserByEmail = function(email , userDb) {
  for (const userId in userDb) {
    const user = userDb[userId];
    if (email === user.email) {
      return user;
    }
  }
  //return false;
};

// adds a new user to user database
const createUser = function(email , password , userDb) {
  const userId = generateRandomString();
  userDb[userId] = {
    id: userId,
    email:email,
    password:password
  };
  return userId;
};

// find the urls created by a user
const urlsForUser = function(id, urlDb) {
  let loggedInUserURL = {};
  for (const urlId in urlDb) {
    if (urlDb[urlId].userID === id) {
      loggedInUserURL[urlId] = urlDb[urlId];
    }
  }
  return loggedInUserURL;
};

// generate a radom shortURL
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

module.exports = {
  findUserByEmail,
  createUser ,
  urlsForUser,
  generateRandomString
};