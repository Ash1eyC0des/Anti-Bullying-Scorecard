const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const userController = require("../controllers/user");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

router.get('/dashboard', ensureAuth, userController.getUserDashboard)

router.get('/settings', ensureAuth, userController.getUserSettings)
router.post('/settings', ensureAuth, userController.updateUserSettings)

router.post('/password', ensureAuth, userController.updatePassword)

router.delete('/delete', ensureAuth, userController.deleteUser)


module.exports = router;
