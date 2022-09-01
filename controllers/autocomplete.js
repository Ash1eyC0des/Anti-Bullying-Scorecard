const School = require('../models/School')

module.exports = {
  // @desc MongoDB Autocomplete Search
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
}
