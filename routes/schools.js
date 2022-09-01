const express = require('express')
const router = express.Router()
const schoolsController = require('../controllers/schools')
const scorecardsController = require('../controllers/scorecards') 
const { ensureAuth, ensureGuest } = require('../middleware/auth')


router.get('/', schoolsController.getSchoolSearch)
router.get('/:id', schoolsController.getSchoolScorecards);

router.get('/:id/create', ensureAuth, scorecardsController.getNewScorecard)
router.post('/:id/create', ensureAuth, scorecardsController.createScorecard)

module.exports = router