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
}    