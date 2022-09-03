const express = require('express')
const router = express.Router()
const schoolsController = require('../controllers/schools')
const scorecardsController = require('../controllers/scorecards') 
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.put('/markUseful', ensureAuth, scorecardsController.markUseful)
router.put('/markNotUseful', ensureAuth, scorecardsController.markNotUseful)

router.delete('/delete', ensureAuth, scorecardsController.deleteScorecard)

router.get('/edit', ensureAuth, scorecardsController.getEditScorecard)
router.put('/edit', ensureAuth, scorecardsController.editScorecard)

module.exports = router