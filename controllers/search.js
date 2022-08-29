const School = require('../models/School')

module.exports = {
  autocompleteSchools: async (req, res) => {
    try {
      const schools = await School.aggregate([
        {
          '$search': {
            'autocomplete': {
              'query': `${req.query.term}`, 
              'path': 'school_name', 
              'fuzzy': {
                'maxEdits': 2,
              }
            }
          }
        }
      ])
      res.send(Array.from(schools))
    } catch(err) {
      res.status(500).send({ message: err.message })
    }
  }, 
  getScorecardsBySchool: async (req, res) => {
    try {
      let schoolData = await School.findById(req.params.id)
      // res.send(result)
      console.log(schoolData)
      res.render('scorecards.ejs', {'school': schoolData})
    } catch(err) {
      res.status(500).send({ message: err.message })
    }
  }
}
