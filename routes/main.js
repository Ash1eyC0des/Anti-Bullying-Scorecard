const express = require("express");
const router = express.Router();
const passport = require('passport');
const userController = require("../controllers/user");
const homeController = require("../controllers/home");
const autocompleteController = require("../controllers/autocomplete");
const { ensureAuth, ensureGuest } = require("../middleware/auth");


router.get("/", homeController.getIndex);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);
router.get('/signup', userController.getSignup);
router.post('/signup', userController.postSignup);


// OAuth authentication routes. (Sign in)
 router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
 router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
   res.redirect(req.session.returnTo || '/');
 });
 router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent' }));
 router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
   res.redirect(req.session.returnTo || '/');
 });

router.get("/autocomplete", autocompleteController.autocompleteSchools);
router.get("/privacy", homeController.getPrivacyPolicy);
router.get("/terms", homeController.getTerms);
router.get("/mission", homeController.getMission);


module.exports = router;
