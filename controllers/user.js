const User = require('../models/User')
const School = require('../models/School')
const Scorecard = require('../models/Scorecard')

module.exports = {
  // @desc User Dashboard
  getUserDashboard: async (req, res) => {
    try {
      const user = await User.findById((req.user.id))
      const scorecards = await Scorecard.find({userId: req.user.id})
      console.log(scorecards)
      const totalScorecards = await Scorecard.countDocuments({userId:req.user.id})
      const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0)
      const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0)
      res.render('dashboard.ejs', {
          'school': req.body.school || '',
          'user': user, 
          'scorecards': scorecards, 
          'total': totalScorecards, 
          'upvotes': upvotes, 
          'downvotes': downvotes
      })
    } catch(err) {
      console.log(err)
    }
  },
  updateUserDashboard: async (req, res)=>{
    try{
        await User.findOneAndUpdate({_id:req.user.id}, {
          
        })
        console.log('User Dashboard Updated')
        res.json('User Dashboard Updated')
    }catch(err){
        console.log(err)
    }
},
  getUserSettings: async (req,res)=> {
    try {
        res.render('settings.ejs', { 'user': req.user })
    }catch(err) {
        console.log(err)
    }
  }
}
