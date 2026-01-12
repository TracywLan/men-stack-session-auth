const dotenv = require("dotenv");
dotenv.config();
require('./db/connection.js');
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";
// Set controllers
const authController = require("./controllers/auth.js");
// express-session module
const session = require('express-session');
// mongostore
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions'  // Creates a "sessions" collection
});
const isSignedIn = require("./middleware/is-signed-in.js");



//Middleware

require('./db/connection')
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan('tiny'));
// express-session
app.use(methodOverride("_method"));
app.use(morgan('dev'));
// new
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// mongostore

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,  // ← Pass the store instance
  })
);



// Routes

app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user, // check if user is logged in
  });
});

// Express will now funnel any requests starting with /auth to the authController
// any route in this file will auto go to /auth
app.use("/auth", authController);



app.get("/vip-lounge", isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});


// app.use(
//   "/vip-lounge",
//   (req, res, next) => {
//     if (req.session.user) {
//       res.locals.user = req.session.user; // Store user info for use in the next function
//       next(); // Proceed to the next middleware or controller
//     } else {
//       res.redirect("/"); // Redirect unauthenticated users
//     }
//   },
//   vipsController // The controller handling the '/vip-lounge' route
// );



// Port

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
