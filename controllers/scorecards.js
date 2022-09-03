const { promiseImpl } = require('ejs')
const School = require('../models/School')
const Scorecard = require('../models/Scorecard')
const User = require('../models/User')


module.exports = {
    // @desc Scorecards by user
    getUserScorecards: async (req,res)=>{
        console.log(req.user)
        try{
            const scorecards = await Scorecard.find({userId: req.user.id}).populate('school')
            // console.log(scorecards)
            const scorecardSchools = scorecards.map(scorecard => `${scorecard.school.school_name}`)
            console.log(scorecardSchools)
            const totalScorecards = await Scorecard.countDocuments({userId:req.user.id})
            const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0)
            const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0)
            res.render('dashboard.ejs', {
                user: req.user, 
                scorecards: scorecards, 
                scorecardSchools: scorecardSchools,
                total: totalScorecards, 
                upvotes: upvotes, 
                downvotes: downvotes
            })
        }catch(err){
            console.log(err)
        }
    },
    // @desc Scorecards by School
    getSchoolScorecards: async (req,res)=>{
        try{
            const schoolData = await School.findById(req.params.id)
            console.log(schoolData)
            const scorecards = await Scorecard.find({schoolId: req.body.schoolId}).populate('user')
            console.log(scorecards)
            const scorecardUsers = scorecards.map(scorecard => `${scorecard.user.firstName} ${scorecard.user.lastName}`)
            const totalScorecards = scorecards.length
            const avgRating = scorecards.reduce((acc, obj) => acc + obj.rating, 0) / +scorecards.length.toFixed(1)
            res.render('scorecards.ejs', {
                'user': req.user,
                'school': schoolData,
                'scorecards': scorecards, 
                'scorecardUsers': scorecardUsers,
                'total': totalScorecards, 
                'avgRating': avgRating, 
            })
        }catch(err){
            res.status(500).send({ message: err.message })
        }
    },
    // @desc New Scorecard
    getNewScorecard: async (req,res)=>{
        try{
            const schoolData = await School.findById(req.params.id)
            const scorecards = await Scorecard.find({schoolId: req.params.id}).populate('user')
            const scorecardUsers = scorecards.map(scorecard =>  `${scorecard.user.firstName} ${scorecard.user.lastName}`)
           
            res.render('create.ejs', {
                'user': req.user, 
                'school': schoolData,
                'scorecards': scorecards, 
                'scorecardUsers': scorecardUsers
            })
        
        }catch(err){
            res.status(500).send({ message: err.message })
        }
    },
    // @desc Post new scorecard
    createScorecard: async (req, res)=>{
        try{
            await Scorecard.create({
                schoolId: req.body.schoolId, 
                userId: req.user.id, 
                date: Date.now(), 
                rating: req.body.rating, 
                title: req.body.title, 
                review: req.body.review, 
                photo: req.body.photo, 
                upvotes: 0, 
                downvotes: 0
            })
            console.log('Scorecard created!')
            res.redirect(`/schools/${req.user.id}/confirm`)
        }catch(err){
            console.log(err)
        }
    },
    // @desc Post new scorecard
    confirmScorecard: async (req, res)=>{
        try{
            res.render('confirm.ejs', {
                'user': req.user,
                'school': req.body.school
            })
        }catch(err){
            console.log(err)
        }
    },
    // @desc +1 to 'Useful' count
    markUseful: async (req, res)=>{
        try{
            await Scorecard.findOneAndUpdate({_id:req.body.scorecardId},{
                upvotes: req.body.upvotes, 
                downvotes: req.body.downvotes
            })
            console.log('Marked Useful')
            res.json('Marked Useful')
        }catch(err){
            console.log(err)
        }
    },
    // @desc +1 'Not Useful' Count
    markNotUseful: async (req, res)=>{
        try{
            await Scorecard.findOneAndUpdate({_id:req.body.scorecardId},{
                upvotes: req.body.upvotes,
                downvotes: req.body.downvotes
            })
            console.log('Marked Not Useful')
            res.json('Marked Not Useful')
        }catch(err){
            console.log(err)
        }
    },
    // @desc Get Edit Scorecard
    getEditScorecard: async (req, res)=>{
        try{
            res.render('confirm.ejs', {
                'user': req.user,
                'school': req.body.school
            })
        }catch(err){
            console.log(err)
        }
    },
    // @desc Post Edit Scorecard  
    editScorecard: async (req, res)=>{
        console.log(req.body.scorecardId)
        try{
            await Scorecard.findOneAndUpdate({_id:req.body.scorecardId}, {
                school: req.body.schoolId,
                user: req.user,
                date: req.body.date,
                rating: req.body.rating,
                title: req.body.title,
                review: req.body.review,
                photo: req.body.photo,
            })
            console.log('Scorecard Updated')
            res.redirect(`schools/${req.body.schoolId}/confirm`)
        }catch(err){
            console.log(err)
        }
    },
    deleteScorecard: async (req, res)=>{
        console.log(req.body.scorecardId)
        try{
            await Scorecard.findOneAndDelete({_id:req.body.scorecardId})
            console.log('Deleted Scorecard')
            res.json('Deleted Scorecard')
        }catch(err){
            console.log(err)
        }
    }
}    