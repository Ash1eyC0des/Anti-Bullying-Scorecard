const { promisify } = require("util");
promisify;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
const passport = require("passport");
const _ = require("lodash");
const validator = require("validator");
const mailChecker = require("mailchecker");
const User = require("../models/User");
const Scorecard = require("../models/Scorecard");

const randomBytesAsync = promisify(crypto.randomBytes);

// Helper Function to Send Mail.
const sendMail = (settings) => {
  let transportConfig;
  if (process.env.SENDGRID_API_KEY) {
    transportConfig = nodemailerSendgrid({
      apiKey: process.env.SENDGRID_API_KEY,
    });
  } else {
    transportConfig = {
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };
  }
  let transporter = nodemailer.createTransport(transportConfig);

  return transporter
    .sendMail(settings.mailOptions)
    .then(() => {
      settings.req.flash(settings.successfulType, {
        msg: settings.successfulMsg,
      });
    })
    .catch((err) => {
      if (err.message === "self signed certificate in certificate chain") {
        console.log(
          "WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production."
        );
        transportConfig.tls = transportConfig.tls || {};
        transportConfig.tls.rejectUnauthorized = false;
        transporter = nodemailer.createTransport(transportConfig);
        return transporter.sendMail(settings.mailOptions).then(() => {
          settings.req.flash(settings.successfulType, {
            msg: settings.successfulMsg,
          });
        });
      }
      console.log(settings.loggingError, err);
      settings.req.flash(settings.errorType, { msg: settings.errorMsg });
      return err;
    });
};

module.exports = {
  // GET /login
  getLogin: (req, res) => {
    if (req.user) {
      return res.redirect("/user/dashboard");
    }
    res.render("login.ejs", {
      title: "Login",
    });
  },

  // POST /login - Sign in using email and password.
  postLogin: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (validator.isEmpty(req.body.password))
      validationErrors.push({ msg: "Password cannot be blank." });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/login");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", info);
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", { msg: "Success! You are logged in." });
        res.redirect(req.session.returnTo || "/user/dashboard");
      });
    })(req, res, next);
  },

  //  GET /logout - Log out.
  logout: (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      req.session.destroy((err) => {
        if (err)
          console.log(
            "Error : Failed to destroy the session during logout.",
            err
          );
        req.user = null;
        res.redirect("/");
      });
    });
  },

  // GET /signup - Signup page.
  getSignup: (req, res) => {
    if (req.user) {
      return res.redirect("/user/dashboard");
    }
    res.render("signup.ejs");
  },

  // POST /signup - Create a new local account.
  postSignup: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirmPassword)
      validationErrors.push({ msg: "Passwords do not match" });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/signup");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    const user = new User({
      name: `${req.body.firstName} ${req.body.lastName}`,
      email: req.body.email,
      password: req.body.password,
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", {
          msg: "Account with that email address already exists.",
        });
        return res.redirect("/signup");
      }
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect("/user/dashboard");
        });
      });
    });
  },

  // GET User Dashboard
  getUserDashboard: async (req, res) => {
    try {
      const scorecards = await Scorecard.find({ user: req.user.id }).populate(
        "school"
      );
      const scorecardSchools = scorecards.map(
        (scorecard) => `${scorecard.school.school_name}`
      );
      const totalScorecards = await Scorecard.countDocuments({
        user: req.user.id,
      });
      const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0);
      const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0);
      res.render("dashboard.ejs", {
        user: req.user,
        school: req.body.school || "",
        scorecards: scorecards,
        scorecardSchools: scorecardSchools,
        total: totalScorecards,
        upvotes: upvotes,
        downvotes: downvotes,
      });
    } catch (err) {
      console.log(err);
    }
  },

  // GET /user/settings - User Settings
  getUserSettings: async (req, res) => {
    try {
      const scorecards = await Scorecard.find({ user: req.user.id });
      const totalScorecards = scorecards.length;
      const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0);
      const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0);
      res.render("settings.ejs", {
        user: req.user,
        school: req.body.school || "",
        total: totalScorecards,
        upvotes: upvotes,
        downvotes: downvotes,
      });
    } catch (err) {
      console.log(err);
    }
  },

  // POST /user/settings - Update profile information.
  postUpdateUserSettings: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/user/settings");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    User.findById(req.user.id, (err, user) => {
      if (err) {
        return next(err);
      }
      if (user.email !== req.body.email) user.emailVerified = false;
      user.email = req.body.email || "";
      user.name = req.body.name || "";
      user.save((err) => {
        if (err) {
          if (err.code === 11000) {
            req.flash("errors", {
              msg: "The email address you have entered is already associated with an account.",
            });
            return res.redirect("/user/settings");
          }
          return next(err);
        }
        req.flash("success", { msg: "Profile information has been updated." });
        res.redirect("/user/settings");
      });
    });
  },

  // POST /user/password - Update current password.
  postUpdatePassword: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirmPassword)
      validationErrors.push({ msg: "Passwords do not match" });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/user/settings");
    }

    User.findById(req.user.id, (err, user) => {
      if (err) {
        return next(err);
      }
      user.password = req.body.password;
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", { msg: "Password has been changed." });
        res.redirect("/user/settings");
      });
    });
  },

  // POST /user/delete - Delete user account.
  postDeleteAccount: (req, res, next) => {
    User.deleteOne({ _id: req.user.id }, (err) => {
      if (err) {
        return next(err);
      }
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        req.flash("info", { msg: "Your account has been deleted." });
        res.redirect("/");
      });
    });
  },

  // GET /user/unlink/:provider - Unlink OAuth provider.
  getOauthUnlink: (req, res, next) => {
    const { provider } = req.params;
    User.findById(req.user.id, (err, user) => {
      if (err) {
        return next(err);
      }
      user[provider.toLowerCase()] = undefined;
      const tokensWithoutProviderToUnlink = user.tokens.filter(
        (token) => token.kind !== provider.toLowerCase()
      );
      // Some auth providers do not provide an email address in the user profile.
      // As a result, we need to verify that unlinking the provider is safe by ensuring
      // that another login method exists.
      if (
        !(user.email && user.password) &&
        tokensWithoutProviderToUnlink.length === 0
      ) {
        req.flash("errors", {
          msg:
            `The ${_.startCase(
              _.toLower(provider)
            )} account cannot be unlinked without another form of login enabled.` +
            " Please link another account or add an email address and password.",
        });
        return res.redirect("/account");
      }
      user.tokens = tokensWithoutProviderToUnlink;
      user.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("info", {
          msg: `${_.startCase(_.toLower(provider))} account has been unlinked.`,
        });
        res.redirect("/account");
      });
    });
  },

  // GET /reset/:token - Reset Password page.
  getReset: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    const validationErrors = [];
    if (!validator.isHexadecimal(req.params.token))
      validationErrors.push({ msg: "Invalid Token.  Please retry." });
    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/forgot");
    }

    User.findOne({ passwordResetToken: req.params.token })
      .where("passwordResetExpires")
      .gt(Date.now())
      .exec((err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          req.flash("errors", {
            msg: "Password reset token is invalid or has expired.",
          });
          return res.redirect("/forgot");
        }
        res.render("account/reset", {
          title: "Password Reset",
        });
      });
  },

  // GET /user/verify/:token - Verify email address
  getVerifyEmailToken: (req, res, next) => {
    if (req.user.emailVerified) {
      req.flash("info", { msg: "The email address has been verified." });
      return res.redirect("/user/dashboard");
    }

    const validationErrors = [];
    if (req.params.token && !validator.isHexadecimal(req.params.token))
      validationErrors.push({ msg: "Invalid Token.  Please retry." });
    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/user/settings");
    }

    if (req.params.token === req.user.emailVerificationToken) {
      User.findOne({ email: req.user.email })
        .then((user) => {
          if (!user) {
            req.flash("errors", {
              msg: "There was an error in loading your profile.",
            });
            return res.redirect("back");
          }
          user.emailVerificationToken = "";
          user.emailVerified = true;
          user = user.save();
          req.flash("info", {
            msg: "Thank you for verifying your email address.",
          });
          return res.redirect("/user/dashboard");
        })
        .catch((error) => {
          console.log(
            "Error saving the user profile to the database after email verification",
            error
          );
          req.flash("errors", {
            msg: "There was an error when updating your profile.  Please try again later.",
          });
          return res.redirect("/user/settings");
        });
    } else {
      req.flash("errors", {
        msg: "The verification link was invalid, or is for a different account.",
      });
      return res.redirect("/user/settings");
    }
  },

  // GET /user/verify - Verify email address
  getVerifyEmail: (req, res, next) => {
    if (req.user.emailVerified) {
      req.flash("info", { msg: "The email address has been verified." });
      return res.redirect("/user/dashboard");
    }

    if (!mailChecker.isValid(req.user.email)) {
      req.flash("errors", {
        msg: "The email address is invalid or disposable and can not be verified.  Please update your email address and try again.",
      });
      return res.redirect("/user/settings");
    }

    const createRandomToken = randomBytesAsync(16).then((buf) =>
      buf.toString("hex")
    );

    const setRandomToken = (token) => {
      User.findOne({ email: req.user.email }).then((user) => {
        user.emailVerificationToken = token;
        user = user.save();
      });
      return token;
    };

    const sendVerifyEmail = (token) => {
      const mailOptions = {
        to: req.user.email,
        from: "dev@ashleychristman.com",
        subject: "Please verify your email address on Hackathon Starter",
        text: `Thank you for registering with Anti-Bullying Scorecard.\n\n
          This verify your email address please click on the following link, or paste this into your browser:\n\n
          http://${req.headers.host}/account/verify/${token}\n\n
          \n\n
          Thank you!`,
      };
      const mailSettings = {
        successfulType: "info",
        successfulMsg: `An e-mail has been sent to ${req.user.email} with further instructions.`,
        loggingError:
          "ERROR: Could not send verifyEmail email after security downgrade.\n",
        errorType: "errors",
        errorMsg:
          "Error sending the email verification message. Please try again shortly.",
        mailOptions,
        req,
      };
      return sendMail(mailSettings);
    };

    createRandomToken
      .then(setRandomToken)
      .then(sendVerifyEmail)
      .then(() => res.redirect("/user/settings"))
      .catch(next);
  },

  //POST /reset/:token - Process the reset password request.
  postReset: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isLength(req.body.password, { min: 8 }))
      validationErrors.push({
        msg: "Password must be at least 8 characters long",
      });
    if (req.body.password !== req.body.confirm)
      validationErrors.push({ msg: "Passwords do not match" });
    if (!validator.isHexadecimal(req.params.token))
      validationErrors.push({ msg: "Invalid Token.  Please retry." });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("back");
    }

    const resetPassword = () =>
      User.findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires")
        .gt(Date.now())
        .then((user) => {
          if (!user) {
            req.flash("errors", {
              msg: "Password reset token is invalid or has expired.",
            });
            return res.redirect("back");
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          return user.save().then(
            () =>
              new Promise((resolve, reject) => {
                req.logIn(user, (err) => {
                  if (err) {
                    return reject(err);
                  }
                  resolve(user);
                });
              })
          );
        });

    const sendResetPasswordEmail = (user) => {
      if (!user) {
        return;
      }
      const mailOptions = {
        to: user.email,
        from: "dev@ashleychristman.com",
        subject: "Your Anti-Bullying Scorecard password has been changed",
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      };
      const mailSettings = {
        successfulType: "success",
        successfulMsg: "Success! Your password has been changed.",
        loggingError:
          "ERROR: Could not send password reset confirmation email after security downgrade.\n",
        errorType: "warning",
        errorMsg:
          "Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.",
        mailOptions,
        req,
      };
      return sendMail(mailSettings);
    };

    resetPassword()
      .then(sendResetPasswordEmail)
      .then(() => {
        if (!res.finished) res.redirect("/");
      })
      .catch((err) => next(err));
  },

  //GET /forgot - Forgot Password page.
  getForgot: (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    res.render("user/forgot", {
      title: "Forgot Password",
    });
  },

  // POST /forgot - Forgot Password page.
  postForgot: (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
      validationErrors.push({ msg: "Please enter a valid email address." });

    if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect("/forgot");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
      gmail_remove_dots: false,
    });

    const createRandomToken = randomBytesAsync(16).then((buf) =>
      buf.toString("hex")
    );

    const setRandomToken = (token) =>
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          req.flash("errors", {
            msg: "Account with that email address does not exist.",
          });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

    const sendForgotPasswordEmail = (user) => {
      if (!user) {
        return;
      }
      const token = user.passwordResetToken;
      const mailOptions = {
        to: user.email,
        from: "dev@ashleychristman.com",
        subject: "Reset your password on Anti-Bullying Scorecard",
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      const mailSettings = {
        successfulType: "info",
        successfulMsg: `An e-mail has been sent to ${user.email} with further instructions.`,
        loggingError:
          "ERROR: Could not send forgot password email after security downgrade.\n",
        errorType: "errors",
        errorMsg:
          "Error sending the password reset message. Please try again shortly.",
        mailOptions,
        req,
      };
      return sendMail(mailSettings);
    };

    createRandomToken
      .then(setRandomToken)
      .then(sendForgotPasswordEmail)
      .then(() => res.redirect("/forgot"))
      .catch(next);
  },
};
