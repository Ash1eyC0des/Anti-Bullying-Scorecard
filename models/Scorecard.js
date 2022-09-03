const mongoose = require('mongoose')
const { Schema } = mongoose

const ScorecardSchema = new mongoose.Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  upvotes: {
    type: Number,
    required: false,
  },
  downvotes: {
    type: Number,
    required: false,
  },


})

module.exports = mongoose.model('Scorecard', ScorecardSchema)