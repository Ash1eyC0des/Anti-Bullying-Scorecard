const express = require('express')
const router = express.Router()
const upload = require("../middleware/multer");
const schoolsController = require('../controllers/schools')
const scorecardsController = require('../controllers/scorecards') 
const { ensureAuth, ensureGuest } = require('../middleware/auth')


router.get('/', schoolsController.getSchoolSearch)
router.get('/:id', scorecardsController.getSchoolScorecards);

router.get('/:id/create', ensureAuth, scorecardsController.getNewScorecard)
router.post('/:id/create', ensureAuth, upload.single("file"), scorecardsController.createScorecard)
router.get('/:id/confirm', ensureAuth, scorecardsController.confirmScorecard)


module.exports = router