require('dotenv').config();

const passport = require('passport');
const googleStrategy = require('passport-google-oauth20');
const HOST = 'http://127.0.0.1';
const PORT = process.env.PORT || 3000;
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
            callbackURL: process.env.NODE_ENV === "production"
            ? `${HOST}/auth/success`
            : `${HOST}:${PORT}/auth/success`,
          passReqToCallback: true,
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

module.exports = passport;