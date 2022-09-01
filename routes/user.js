const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const userController = require("../controllers/user");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get('/dashboard', ensureAuth, userController.getUserDashboard)
// router.put('/dashboard', ensureAuth, userController.updateUserDashboard)

router.get('/settings', ensureAuth, userController.getUserSettings)
// router.put('/settings', ensureAuth, userController.updateUserSettings)


module.exports = router;
