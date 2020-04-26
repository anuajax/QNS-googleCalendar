# QNS Google Calendar Events
## About the app
In this simple application we authenticate user with Google OAuth 2.0 and use the authentication token to call Google API to retrieve protected data, in this case next 20 events from the primary calendar.

## To use this repo on your computer:
  1. Go to your Command Line, in desired location, type  :
  
          git clone https://github.com/anuajax/QNS-googleCalendar.git
          cd QNS-googleCalendar
          npm install
  2. Create a .env file and inside that put the following:
                                 
         GOOGLE_CLIENT_ID = YOUR CLIENT ID From developers console project.        
         GOOGLE_CLIENT_SECRET = YOUR CLIENT Secret From developers console project.
         SESSION_NAME = "GoogleOAuthSession"
         SESSION_SECRET = "secretsecret"
   3. Then run:
            
            node app.js
   4. From the browser: 
            
            http://localhost:8080/
            
  When you run you will get the home page click the button, it will prompt you to login from gmail choose your gmail account.
  After successful signin, it may show a warning that "This App is not verified" if you trust my app or not.
  Just click on Advanced > Go to Quickstart(unsafe) ..dont worry it will just give you a warning that this app is accessing your           calendar(Google has their security concerns with your account).Click on allow access and you'll see your events. 
      
## App setup and Workflow:
##  1.Initialize project:
   We initialize the project npm init and create app.js file and install all dependencies.Create a server in app.js file.
   
    //installing dependencies from command line
    npm install dotenv ejs express express-session googleapis@43.0.0 passport passport-google-oauth20 query-string --save
    
    #creating server in app.js file
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT,()=> {
    console.log(`SERVER ACTIVE ON PORT ${PORT}`)
    })
    
##  2.Create Application using Google API Console.
  Acquiring Client ID and Client secret of the application we created as well as setting authorized origins and   redirect URIs. This client ID and client secret will be used to identify and create connection between Google OAuth Client and our application.
  We will save client id and client secret as a environment variable in .env file.
  Enable the Google Calendar API from developer console.
##  3.Generate Authentication URL
 To access Google APIs on behalf of a user, we should get permission and retrieve an access token. For this we should redirect user to a consent page which will state what services the app intend to use.
 We will render a simple page with Login with Google button which will redirect the user to a route that will generate and redirect user to the authentication URL.
 
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
   ##  5.Creating Express routes with Node.js
 For this we create a Node.js Express server. I used ejs(plain and simple) for rendering html and session management I used express-    sessions library.
 Add the routes :
     
     //This will redirect to the Authentication url generated in Step 3.
     router.get('/login', (req, res) => {
    res.redirect(googleUtil.urlGoogle());
      });
  /home route will check for check for session and if user is authenticated and redirect and render the dashboard with events.
  But to extract the events , we need one more file explained in step 6.
      
      router.get('/home', (req, res) => {
    // check for valid session
    if (req.session.user) {
    // get oauth2 client
     const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
       access_token: req.session.user.accessToken
        });
    // get calendar events by passing oauth2 client
        googleCalenderService.listEvents(oauth2Client, (events) => {  
            console.log(events);
                const data = {
                name: req.session.user.name,
                displayPicture: req.session.user.displayPicture,
                id: req.session.user.id,
                email: req.session.user.email,
                events: events
            }
            res.render('dashboard.ejs', data);
         });  
      } else {
        res.redirect('/login')
      }
    });
##  6.Access Protected Resources
  Now our app is authorized to access protected information of the user. To access the protected information we have to call the            relevant Google API by passing our authorized oauth2 client.
## code
      const { google } = require('googleapis');
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
  Our application purpose is to access to google calendar events. It just simple as the above request. We pass our authorized             oauth2 client to calendar API and the API will send the requested information.

   Add somed styling with Bootstrap and css.
      
