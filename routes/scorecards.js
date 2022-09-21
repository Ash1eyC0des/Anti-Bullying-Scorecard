const express = require('express')
const router = express.Router()
const upload = require("../middleware/multer");
const schoolsController = require('../controllers/schools')
const scorecardsController = require('../controllers/scorecards') 
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.put('/markUseful', ensureAuth, scorecardsController.markUseful)
router.put('/markNotUseful', ensureAuth, scorecardsController.markNotUseful)

router.delete('/delete', ensureAuth, scorecardsController.deleteScorecard)

router.post('/:id/edit', ensureAuth, upload.single("file"), scorecardsController.editScorecard)
router.get('/:id/edit', ensureAuth, scorecardsController.getEditScorecard)

module.exports = router