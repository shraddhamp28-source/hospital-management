const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientType: { type: String, required: true },
    patientName: { type: String },
    patientLastName: { type: String },
    mobileNumber: { type: String, required: true },
    email: { type: String },
    gender: { type: String },
    dob: { type: Date },
    uhid: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    referenceId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
