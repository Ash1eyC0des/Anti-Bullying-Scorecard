const School = require('../models/School')
const Scorecard = require('../models/Scorecard')

module.exports = {
    // @desc Scorecards by user
    getUserScorecards: async (req,res)=>{
        console.log(req.user)
        try{
            const scorecards = await Scorecard.find({userId: req.user.id})
            console.log(scorecards)
            const totalScorecards = await Scorecard.countDocuments({userId:req.user.id})
            const upvotes = scorecards.reduce((acc, obj) => acc + obj.upvotes, 0)
            const downvotes = scorecards.reduce((acc, obj) => acc + obj.downvotes, 0)
            res.render('dashboard.ejs', {
                user: req.user, 
                scorecards: scorecards, 
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
            const scorecards = await Scorecard.find({schoolId: req.body.schoolId})
            console.log(scorecards)
            const totalScorecards = scorecards.length
            const avgRating = scorecards.reduce((acc, obj) => acc + obj.rating, 0) / +scorecards.length.toFixed(1)
            res.render('scorecards.ejs', {
                'school': schoolData,
                'scorecards': scorecards, 
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
            console.log(schoolData)
            const scorecards = await Scorecard.find({schoolId: req.body.schoolId})
            console.log(scorecards)
            res.render('create.ejs', {
                'school': schoolData,
                'scorecards': scorecards, 
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
            res.redirect('/confirm')
        }catch(err){
            console.log(err)
        }
    },
    markComplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: true
            })
            console.log('Marked Complete')
            res.json('Marked Complete')
        }catch(err){
            console.log(err)
        }
    },
    markIncomplete: async (req, res)=>{
        try{
            await Todo.findOneAndUpdate({_id:req.body.todoIdFromJSFile},{
                completed: false
            })
            console.log('Marked Incomplete')
            res.json('Marked Incomplete')
        }catch(err){
            console.log(err)
        }
    },
    deleteTodo: async (req, res)=>{
        console.log(req.body.todoIdFromJSFile)
        try{
            await Todo.findOneAndDelete({_id:req.body.todoIdFromJSFile})
            console.log('Deleted Todo')
            res.json('Deleted It')
        }catch(err){
            console.log(err)
        }
    }
}    