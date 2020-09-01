var express = require('express');
var router = express.Router();
var session = require('express-session');
const path = require('path');

const multer = require('multer');
var appMessages = require('../appMessages/appMessages');

// Session constants:
SESSION_NAME = 'sid';
SESSION_SECRET = '1O!P3/2J*hG&56^te#e0$90?0P.k6';

// Time definition in miliseconds:
const ONE_HOUR = 1000 * 60 * 60;

// Session setup:
router.use(session({
  name: SESSION_NAME,
  cookie: {
    maxAge: ONE_HOUR * 12
  },
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET
}));

// MySql connection
var db = require('../config/databaseConnection');

// User ID and Token generator
var IDandTokenGenerator = require('../IDandTokenGenerator/IDandTokenGenerator');

// Mailer
var mailer = require('../mailer/mailer');

// Redirect functions:
const redirectToLogin = (req, res, next) => {
  if(!req.session.userID) {
    res.redirect('/login');
  } else {
    next();
  }
}
const redirectToHome = (req, res, next) => {
  if(req.session.userID) {
    res.redirect('/home');
  } else {
    next();
  }
}

/* Function is executed before any request, we put data in response.locals */
router.use(async (req, res, next) => {
  // Safe way to get the user ID from session
  const { userID } = req.session;
  if(userID) {
    // Get user data
    let username = await db.getUsername(userID);
    let user = await db.getUserInfo(username);
    // Get user friends list
    let friends = await db.getFriendsList(username);
    // Turn friends list lastCall back to Date object
    friends.forEach(friend => {
      friend.lastCall = new Date(parseInt(friend.lastCall));
    });
    // Save user data
    res.locals.user = {
      userData: user,
      friendsList: friends
    };
  }

  // Handle the request
  next();
});

/* GET login page */
router.get('/', function(req, res, next) {
  res.redirect('/login');
  res.end();
});

router.get('/login', redirectToHome, function(req, res, next) {
  res.render('login', { title: 'Login' });
  res.end();
});

/* GET home page */
router.get('/home', redirectToLogin, function(req, res, next) {
  res.render('home', { title: 'Home', data: JSON.stringify(res.locals.user) });
  res.end();
});

/* GET upload-profile-picture page */
router.get('/upload-profile-picture', redirectToLogin, function(req, res, next) {
  res.render('upload-profile-picture', { title: 'Upload new profile picture', data: JSON.stringify(res.locals.user) });
  res.end();
});

/* GET activate page */
router.get('/activate', redirectToHome, function(req, res, next) {
  res.render('activate', { title: 'Activate your account' });
  res.end();
});

/* GET app message page */
router.get('/app-message', function(req, res, next) {
  messageObject = {
    title: 'App message',

    message: '',
    image: '/images/error_icon.png',
    buttonNames: ["Back"],
    buttonTypes: [0],
    buttonRedirectTo: ["login"],
    withCloseButton : 'false'
  };
  var messageIndex = req.query.messageIndex;
  if(messageIndex != undefined)
    messageObject = appMessages[messageIndex];
  res.render('app-message', messageObject);
  res.end();
});

/* POST auth page */
router.post('/auth', redirectToHome, async function(request, response) {
  // Get form data
	var username = request.body.username;
  var password = request.body.password;

  try {

  // Check form data
	if(username && password) {
    state = await db.accountCheck(username);
    if(state == -1) {
      // Account does not exist
      response.redirect('/app-message?messageIndex=1');
      response.end();
    } else {
      if(state == 0) {
        // Redirect to activate account page
        response.redirect('/activate');
        response.end();
      } else {
        if(await db.userPasswordCheck(username, password) == 0) {
          // Check for token
          if(await db.checkToken(username, password) == 1) {
            // Destroy the token
            await db.destroyToken(username);
            // Add user ID to session
            request.session.userID = await db.getUserID(username);

            response.redirect('/home');
            response.end();
          } else {
            // Wrong username or password
            response.redirect('/app-message?messageIndex=2');
            response.end();
          }
        } else {
          // Add user ID to session
          request.session.userID = await db.getUserID(username);

          response.redirect('/home');
          response.end();
        }
      }
    }
	} else {
		// Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST register page */
router.post('/register', redirectToHome, async function(request, response) {
  // Get form data
  var user = {};
	user.username = request.body.usernameSignUp;
  user.password = request.body.passwordSignUp;
  user.firstname = request.body.firstName;
  user.lastname = request.body.lastName;
  user.email = request.body.email;

  try {

  let generator = new IDandTokenGenerator();
  // Check form data
	if(user.username && user.password && user.firstname && user.lastname && user.email) {
    // Check if username is taken
    if(await db.isUsernameFree(user.username) == 0) {
      response.redirect('/app-message?messageIndex=4');
      response.end();
    } else {
      // Generate ID
      user.id = generator.generateUserID();
      // Insert user into DB
      await db.insertUser(user);
      // Generate Token and add it to DB
      var token = generator.generateToken();
      await db.addToken(user.username, token);
      // Send email
      mailer.sendEmail(user, 0);
      mailer.sendEmail(user, 1, token);
      // Redirect to succesful account creation message page
      response.redirect('/app-message?messageIndex=3');
      response.end();
    }
	} else {
		// Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST activate-process page */
router.post('/activate-process', redirectToHome, async function(request, response) {
  // Get form data
	username = request.body.username;
  token = request.body.token;

  try {

    if(username && token) {
      state = await db.accountCheck(username);
      if(state == -1) {
        // Account does not exist
        response.redirect('/app-message?messageIndex=1');
        response.end();
      } else {
        if(state == 0) {
          // Check token
          if(await db.checkToken(username, token) == 1) {
            // Activate account
            await db.confirmAccount(username);
            // Destroy token
            await db.destroyToken(username);
            // Account activation notification
            response.redirect('/app-message?messageIndex=5');
            response.end();
          } else {
            // Wrong token
            response.redirect('/app-message?messageIndex=7');
            response.end();
          }
        } else {
          // Account already activated
          response.redirect('/app-message?messageIndex=6');
          response.end();
        }
      } 
    } else {
		  // Error
      response.redirect('/app-message?messageIndex=0');
      response.end();
    }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST forgot-pass page */
router.post('/forgot-pass', redirectToHome, async function(request, response) {
  // Get form data
  username = request.body.usernameRecovery;
	email = request.body.recoveryEmail;

  try {

    let generator = new IDandTokenGenerator();
    if(username && email) {
      // Check user & email combo
      if(await db.checkEmail(username, email) == 1) {
        // Destroy old tokens
        await db.destroyToken(username);
        // Create new token
        let token = generator.generateToken();
        // Save token to DB
        await db.addToken(username, token);

        // Send email with token
        let info = await db.getUserInfo(username);
        let user = {};
        user.username = username;
        user.firstname = info.firstName;
        user.lastname = info.lastName;
        user.email = email;
        mailer.sendEmail(user, 2, token);

        // Token sent notification
        response.redirect('/app-message?messageIndex=8');
        response.end();
      } else {
        // Wrong user & email combo
        response.redirect('/app-message?messageIndex=9');
        response.end();
      }
    } else {
		  // Error
      response.redirect('/app-message?messageIndex=0');
      response.end();
    }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

  response.end();
});

/* POST change-password page */
router.post('/change-password', redirectToLogin, async function(request, response) {
  // Get form data
  password = request.body.passwordReset;

  try {

    if(password) {
      const { userID } = request.session;
      await db.changePassword(userID, password);

      // Password reset notification
      response.redirect('/app-message?messageIndex=11');
      response.end();
    } else {
		  // Error
      response.redirect('/app-message?messageIndex=0');
      response.end();
    }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST change-email page */
router.post('/change-email', redirectToLogin, async function(request, response) {
  // Get form data
  email = request.body.emailReset;

  try {

    if(password) {
      const { userID } = request.session;
      await db.changeEmail(userID, email);

      // Email reset notification
      response.redirect('/app-message?messageIndex=12');
      response.end();
    } else {
		  // Error
      response.redirect('/app-message?messageIndex=0');
      response.end();
    }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST add-friend page */
router.post('/add-friend', redirectToLogin, async function(request, response) {
  // Get form data
  friendID = request.body.addFriend;

  try {

    if(friendID) {
      const { userID } = request.session;
      const time = Date.now();
      var status = await db.addToFriendsList(userID, friendID, time);

      switch(status) {
        case -2:
          response.redirect('/app-message?messageIndex=13');
          response.end();
          break;
        case -1:
          response.redirect('/app-message?messageIndex=14');
          response.end();
          break;
        case 0:
          response.redirect('/app-message?messageIndex=15');
          response.end();
          break;
        case 1:
          response.redirect('/app-message?messageIndex=16');
          response.end();
          break;
      }
    } else {
		  // Error
      response.redirect('/app-message?messageIndex=0');
      response.end();
    }

  } catch(err) {
    console.log(err);
    // Error
    response.redirect('/app-message?messageIndex=0');
    response.end();
  }

});

/* POST upload-process page */
router.post('/upload-process', redirectToLogin, (req, res) => {
  try{

  // Get form data to get file name
  const { userID } = req.session;
  var newPath;

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/userProfilePictures');
    },

    filename: function(req, file, cb) {
      newPath = userID + path.extname(file.originalname);
      cb(null, userID + path.extname(file.originalname));
    }
  });

  const upload = multer({
    limits: {
      fileSize: 4 * 1024 * 1024
    },
    storage: storage
  });

  // Search by name of HTML form input
  let imgUpload = upload.single('image');

  imgUpload(req, res, function(err) {

      if (req.fileValidationError) {
          console.log(err);
          // Error
          res.redirect('/app-message?messageIndex=10');
          res.end();
      }
      else if (!req.file) {
          console.log(err);
          // Missing profile picture
          res.redirect('/app-message?messageIndex=10');
          res.end();
      }
      else if (err) {
          console.log(err);
          // Error
          res.redirect('/app-message?messageIndex=10');
          res.end();
      }

      // Success
      db.addProfilePicture(userID, newPath);
      res.redirect('/home');
      res.end();
  });

  } catch(err) {
    console.log(err);
    // Error
    res.redirect('/app-message?messageIndex=10');
    res.end();
  }
});

/* POST logout page */
router.post('/logout', redirectToLogin, async function(request, response) {
  request.session.destroy(err => {
    if(err) {
      response.redirect('/home');
      response.end();
    }

    response.clearCookie(SESSION_NAME);
    response.redirect('/login');
    response.end();
  });
});

module.exports = router;
