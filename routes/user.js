const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const userController = require('../controllers/user')
const { ensureAuth, ensureGuest } = require("../middleware/auth");


router.get('/dashboard', ensureAuth, userController.getUserDashboard)

router.get('/settings', ensureAuth, userController.getUserSettings)
router.post('/settings', ensureAuth, upload.single("file"), userController.postUpdateUserSettings)

router.post('/password', ensureAuth, userController.postUpdatePassword)

router.post('/delete', ensureAuth, userController.postDeleteAccount)

router.get('/unlink/:provider', ensureAuth, userController.getOauthUnlink)

router.get('/verify', ensureAuth, userController.getVerifyEmail)
router.get('/verify/:token', ensureAuth, userController.getVerifyEmailToken)


module.exports = router;
