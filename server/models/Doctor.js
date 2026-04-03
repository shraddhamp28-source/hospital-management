const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    speciality: { type: String, required: true },
    specialityInfo: { type: String, required: false },
    experience: { type: String, required: true },
    qualification: { type: String, required: true },
    availableDays: { type: String, required: true }
});

module.exports = mongoose.model('Doctor', doctorSchema);
