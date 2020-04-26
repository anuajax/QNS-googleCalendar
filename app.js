require('dotenv').config();
const express = require('express');
const session = require('express-session');
const indexRoutes = require('./routes/indexroute.js');

const app = express();
app.set("view engine","ejs");

// this files contain static files : css and js for views
app.use(express.static('public'))

// express-session configuration
app.use(
    session({
      name: 'anu',
      saveUninitialized: true,
      resave: false,
      secret: 'sssh, quiet! it\'s a secret!',
      cookie: {
        path: "/auth/success",
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true,
        httpOnly: true,
        secure: true
      }
    })
  )
// index route
app.use(indexRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT,()=> {
console.log(`SERVER ACTIVE ON PORT ${PORT}`)
})

module.exports = app;
