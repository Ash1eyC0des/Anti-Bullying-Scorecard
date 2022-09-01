const School = require('../models/School')
const Scorecard = require('../models/Scorecard')

module.exports = {
    // @desc School Search
    getSchoolSearch: async (req,res)=> {
      try {
          res.render('schools.ejs',{
            'user': req.user,
          })
      }catch(err) {
          console.log(err)
      }
    },
    // @desc Scorecards by School
    getSchoolScorecards: async (req,res)=> {
        try{
            const schoolData = await School.findById(req.params.id)
            console.log(schoolData)
            const scorecards = await Scorecard.find({schoolId: req.body.schoolId})
            console.log(scorecards)
            const totalScorecards = scorecards.length
            const avgRating = scorecards.reduce((acc, obj) => acc + obj.rating, 0) / +scorecards.length.toFixed(1)
            res.render('scorecards.ejs', {
                'user': req.user,
                'school': schoolData,
                'scorecards': scorecards, 
                'total': totalScorecards, 
                'avgRating': avgRating, 
            })
        }catch(err) {
            res.status(500).send({ message: err.message })
        }
    },
}    