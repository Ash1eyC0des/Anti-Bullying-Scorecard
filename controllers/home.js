const Scorecard = require('../models/Scorecard')

module.exports = {
  getIndex: async (req,res)=>{
    try {
      const scorecards = await Scorecard.find({})
        .populate('user')
        .populate('school')
        .sort({ date: -1 })
        .limit(5)
        .lean()
      console.log(scorecards)
      const scorecardUsers = scorecards.map(scorecard => scorecard.user.name)
      const scorecardSchools = scorecards.map(scorecard => scorecard.school.school_name)
      res.render('index.ejs', { 
        user: req.user, 
        scorecards: scorecards, 
        scorecardUsers: scorecardUsers, 
        scorecardSchools: scorecardSchools
      })
    } catch(err) {
      console.log(err)
    }
  }, 
  getPrivacyPolicy: (req, res) => {
    try {
      res.render('privacy.ejs', {
        user: req.user, 
        school: '',
     })
    } catch(err) {
      console.log(err)
    }
  }, 
  getTerms: (req, res) => {
    try {
      res.render('terms.ejs', {
        user: req.user, 
        school: '',
     })
    } catch(err) {
      console.log(err)
    }
  }, 
  getMission: (req, res) => {
    try {
      res.render('mission.ejs', {
        user: req.user, 
        school: '',
     })
    } catch(err) {
      console.log(err)
    }
  }, 
}