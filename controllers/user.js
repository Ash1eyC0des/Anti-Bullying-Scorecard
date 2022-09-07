const validator = require('validator')
const User = require('../models/User')
const School = require('../models/School')
const Scorecard = require('../models/Scorecard')
const { findById } = require('../models/User')

module.exports = {
  // @desc User Dashboard
  getUserDashboard: async (req, res) => {
    try {
      const scorecards = await Scorecard.find({user: req.user.id}).populate('school')
      const scorecardSchools = scorecards.map(scorecard => `${scorecard.school.school_name}`)
      const totalScorecards = await Scorecard.countDocuments({user:req.user.id})
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
      const scorecards = await Scorecard.find({user: req.user.id})
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
      req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false })
        await User.findOneAndUpdate({_id:req.user.id}, req.body)
        console.log('User Settings Updated')
        req.flash('success', { msg: 'Success! Your settings have been updated.' })
        res.redirect('/user/settings')
    } catch(err){
        console.log(err)
    }
  },
  updatePassword: (req, res) => {
    try{
      const validationErrors = []

      if (!validator.isLength(req.body.password, { min: 8 })) validationErrors.push({ msg: 'Password must be at least 8 characters long' })
      if (req.body.password !== req.body.confirmPassword) validationErrors.push({ msg: 'Passwords do not match' })
    
      if (validationErrors.length) {
        console.log(validationErrors)
        req.flash('errors', validationErrors)
        return res.redirect('/user/settings')
      }

      User.findById(req.user.id, (err, user) => {
        if (err) { return next(err) }
        user.password = req.body.password
        user.save((err) => {
          if (err) { return next(err) }
          req.flash('success', { msg: 'Password has been changed.' });
          res.redirect('/user/dashboard')
        })
      })
    } catch(err) {
      console.log(err)
    }
  },
  deleteUser: (req, res, next) => {
    User.deleteOne({ _id: req.user.id }, (err) => {
      if (err) { return next(err); }
      req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
      });
    })
  }
}
