const mongoose = require('mongoose')

const SchoolSchema = new mongoose.Schema({
  year: Number,
  school_id: String,
  school_name: String,
  leaid: String,
  lea_name: String,
  state_leaid: String,
  street_location: String,
  city_location: String,
  state_location: String,
  zip_location: String,
  phone: String,
  latitude: Number,
  longitude: Number,
  urban_centric_locale: Number,
  county_code: Number,
  lowest_grade_offered: Number,
  highest_grade_offered: Number,
  charter: Number,
  magnet: Number,
  virtual: Number
})

module.exports = mongoose.model('School', SchoolSchema, 'schools')