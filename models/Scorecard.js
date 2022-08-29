const mongoose = require('mongoose')

const ScorecardSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: false,
  },


})

module.exports = mongoose.model('Scorecard', ScorecardSchema)