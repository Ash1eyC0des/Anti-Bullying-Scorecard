const User = require('../models/User')
const School = require('../models/School')
const Scorecard = require('../models/Scorecard')

module.exports = {
  // @desc User Dashboard
  getUserDashboard: async (req, res) => {
    try {
      const scorecards = await Scorecard.find({userId: req.user.id}).populate('school')
      const scorecardSchools = scorecards.map(scorecard => `${scorecard.school.school_name}`)
      const totalScorecards = await Scorecard.countDocuments({userId:req.user.id})
      const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0)
      const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0)
      res.render('dashboard.ejs', {
          user: req.user, 
          school: req.body.school || '',
          scorecards: scorecards, 
          scorecardSchools: scorecardSchools,
          total: totalScorecards, 
          upvotes: upvotes, 
          downvotes: downvotes
      })
    } catch(err) {
      console.log(err)
    }
  },
  getUserSettings: async (req, res) => {
    try {
      const scorecards = await Scorecard.find({userId: req.user.id})
      const totalScorecards = scorecards.length
      const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0)
      const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0)
      res.render('settings.ejs', {
          user: req.user, 
          school: req.body.school || '',
          total: totalScorecards, 
          upvotes: upvotes, 
          downvotes: downvotes
      })
    }catch(err) {
      console.log(err)
    }
  },
  updateUserSettings: async (req, res)=>{
    try {
        await User.findOneAndUpdate({_id:req.user.id}, req.body)
        console.log('User Dashboard Updated')
        res.json('User Dashboard Updated')
    } catch(err){
        console.log(err)
    }
  },
}
