# QNS Google Calendar Events
## About the app
In this simple application we authenticate user with Google OAuth 2.0 and use the authentication token to call Google API to retrieve protected data, in this case next 20 events from the primary calendar.
## App setup and Workflow:
##  1.Initialize ptoject:
       We initialize the project npm init and create app.js file and install all dependencies.
##  2.Create Application using Google API Console.
      Acquiring Client ID and Client secret of the application we created as well as setting authorized origins and   redirect URIs. This client ID and client secret will be used to identify and create connection between Google OAuth Client and our application.
      We will save client id and client secret as a environment variable in .env file.
      Enable the Google Calendar API from developer console.
##  3.Generate Authentication URL
      To access Google APIs on behalf of a user, we should get permission and retrieve an access token. For this we should redirect user to a consent page which will state what services the app intend to use.
      We will render a simple page with Login with Google button which will redirect the user to a route that will generate and redirect user to the authentication URL.
      const { google } = require('googleapis');
## code from util/google-util.js:
    

    // google app config
        const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: 'http://localhost:8080/auth/success'
       }

       // scopes use for the application
       const defaultScope = [
       'https://www.googleapis.com/auth/calendar.events.readonly',
        'profile',
       'email'
       ]
       // oauth2 client
       function createConnection() {
       return new google.auth.OAuth2(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirect
       );
       }
       // generate authentication url
       function getConnectionUrl(auth) {
       return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: defaultScope
       });
       }


## continued..
      Here we create a local oauth2 client giving our application details. Then we add our application scopes and send to the Google authentication server. Server will return a specific authentication URL for our request. This is the first communication we have with Google servers and oauth2 client. In our application we have to redirect the user to URL returned from Google which will present a consent screen as follows.
## Configure Passport.js oAuth :
       passport.serializeUser((user, done) => {
    const session = {
        id: user.gooogleID,
        token: user.accessToken,
        name: user.name,
        displayPicture: user.url,
        email: user.email
    }
    done(null, session);
       });

       passport.deserializeUser((sessionUser, done) => {
    done(null, sessionUser)
       });
       passport.use(
              new googleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/success'
        },
        (accessToken, refreshToken, profile, done) => {
            const session = {
                token: accessToken,
                name: profile.displayName,
                displayPicture: profile._json.picture,
                email: profile._json.email
            }

            done(null, session);
               }
        )
       );
##  5.Access Protected Resources
      Now our app is authorized to access protected information of the user. To access the protected information we have to call the            relevant Google API by passing our authorized oauth2 client.
## code
               module.exports.listEvents = function (auth, cb) {
         const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        cb(events)
      } else {
        console.log('No upcoming events found.');
      }
    });
  }
## continued..
             By this we can access the personal profile information calling oauth2 API.
       Our application purpose is to access to google calendar events. It just simple as the above request. We pass our authorized                 oauth2 client to calendar API and the API will send the requested information.
##  6.Finally creating Express server with Node.js
      For this we create a Node.js Express server. I used ejs(plain and simple) for rendering html and session management I used express-sessions library. 
      Add somed styling with Bootstrap and css.
