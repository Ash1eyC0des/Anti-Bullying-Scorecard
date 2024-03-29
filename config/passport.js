const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const refresh = require("passport-oauth2-refresh");
const moment = require("moment");
const User = require("../models/User");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  // Sign in using Email and Password.
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }
        if (!user.password) {
          return done(null, false, {
            msg: "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.",
          });
        }
        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, { msg: "Invalid email or password." });
        });
      });
    })
  );

  /**
   * OAuth Strategy Overview
   *
   * - User is already logged in.
   *   - Check if there is an existing account with a provider id.
   *     - If there is, return an error message. (Account merging not supported)
   *     - Else link new OAuth account with currently logged-in user.
   * - User is not logged in.
   *   - Check if it's a returning user.
   *     - If returning user, sign in and we are done.
   *     - Else check if there is an existing account with user's email.
   *       - If there is, return an error message.
   *       - Else create a new account.
   */

  // Sign in with Facebook.
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
        profileFields: [
          "name",
          "email",
          "link",
          "locale",
          "timezone",
          "gender",
        ],
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) {
              return done(err);
            }
            if (existingUser) {
              req.flash("errors", {
                msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.",
              });
              done(err);
            } else {
              User.findById(req.user.id, (err, user) => {
                if (err) {
                  return done(err);
                }
                user.facebook = profile.id;
                user.tokens.push({ kind: "facebook", accessToken });
                user.profile.name =
                  user.profile.name ||
                  `${profile.name.givenName} ${profile.name.familyName}`;
                user.picture =
                  user.picture ||
                  `https://graph.facebook.com/${profile.id}/picture?type=large&access_token=${accessToken}`;
                user.save((err) => {
                  req.flash("info", {
                    msg: "Facebook account has been linked.",
                  });
                  done(err, user);
                });
              });
            }
          });
        } else {
          User.findOne({ facebook: profile.id }, (err, existingUser) => {
            if (err) {
              return done(err);
            }
            if (existingUser) {
              return done(null, existingUser);
            }
            User.findOne(
              { email: profile._json.email },
              (err, existingEmailUser) => {
                if (err) {
                  return done(err);
                }
                if (existingEmailUser) {
                  req.flash("errors", {
                    msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.",
                  });
                  done(err);
                } else {
                  const user = new User();
                  user.email = profile._json.email;
                  user.facebook = profile.id;
                  user.tokens.push({ kind: "facebook", accessToken });
                  user.name = `${profile.name.givenName} ${profile.name.familyName}`;
                  user.picture = `https://graph.facebook.com/${profile.id}/picture?type=large&access_token=${accessToken}`;
                  user.save((err) => {
                    done(err, user);
                  });
                }
              }
            );
          });
        }
      }
    )
  );

  // Sign in with Google
  const googleStrategyConfig = new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    (req, accessToken, refreshToken, params, profile, done) => {
      if (req.user) {
        User.findOne({ google: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser && existingUser.id !== req.user.id) {
            req.flash("errors", {
              msg: "There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.",
            });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) {
                return done(err);
              }
              user.google = profile.id;
              user.tokens.push({
                kind: "google",
                accessToken,
                accessTokenExpires: moment()
                  .add(params.expires_in, "seconds")
                  .format(),
                refreshToken,
              });
              user.name = user.name || profile.displayName;
              user.picture = user.picture || profile._json.picture;
              user.save((err) => {
                req.flash("info", { msg: "Google account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ google: profile.id }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            return done(null, existingUser);
          }
          User.findOne(
            { email: profile.emails[0].value },
            (err, existingEmailUser) => {
              if (err) {
                return done(err);
              }
              if (existingEmailUser) {
                req.flash("errors", {
                  msg: "There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.",
                });
                done(err);
              } else {
                const user = new User();
                user.email = profile.emails[0].value;
                user.google = profile.id;
                user.tokens.push({
                  kind: "google",
                  accessToken,
                  accessTokenExpires: moment()
                    .add(params.expires_in, "seconds")
                    .format(),
                  refreshToken,
                });
                user.name = profile.displayName;
                user.picture = profile._json.picture;
                user.save((err) => {
                  done(err, user);
                });
              }
            }
          );
        });
      }
    }
  );
  passport.use("google", googleStrategyConfig);
  refresh.use("google", googleStrategyConfig);

  // Authorization Required middleware.
  isAuthorized: (req, res, next) => {
    const provider = req.path.split("/")[2];
    const token = req.user.tokens.find((token) => token.kind === provider);
    if (token) {
      // Is there an access token expiration and access token expired?
      // Yes: Is there a refresh token?
      //     Yes: Does it have expiration and if so is it expired?
      //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
      //       No, Quickbooks and Google- refresh token and save, and then go to next();
      //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
      // No: we are good, go to next():
      if (
        token.accessTokenExpires &&
        moment(token.accessTokenExpires).isBefore(
          moment().subtract(1, "minutes")
        )
      ) {
        if (token.refreshToken) {
          if (
            token.refreshTokenExpires &&
            moment(token.refreshTokenExpires).isBefore(
              moment().subtract(1, "minutes")
            )
          ) {
            res.redirect(`/auth/${provider}`);
          } else {
            refresh.requestNewAccessToken(
              `${provider}`,
              token.refreshToken,
              (err, accessToken, refreshToken, params) => {
                User.findById(req.user.id, (err, user) => {
                  user.tokens.some((tokenObject) => {
                    if (tokenObject.kind === provider) {
                      tokenObject.accessToken = accessToken;
                      if (params.expires_in)
                        tokenObject.accessTokenExpires = moment()
                          .add(params.expires_in, "seconds")
                          .format();
                      return true;
                    }
                    return false;
                  });
                  req.user = user;
                  user.markModified("tokens");
                  user.save((err) => {
                    if (err) console.log(err);
                    next();
                  });
                });
              }
            );
          }
        } else {
          res.redirect(`/auth/${provider}`);
        }
      } else {
        next();
      }
    } else {
      res.redirect(`/auth/${provider}`);
    }
  };
};
