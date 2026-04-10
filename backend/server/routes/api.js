const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Get all doctors
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get booked slots for a doctor on a specific date
router.get('/booked-slots', async (req, res) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
        return res.status(400).json({ message: "doctorId and date are required." });
    }

    try {
        const appointmentDate = new Date(date);
        const bookedSlots = await Appointment.find({
            doctorId,
            date: appointmentDate
        }).select('time');
        
        res.json(bookedSlots.map(app => app.time));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lookup appointment by Reference ID
router.get('/appointments/:refId', async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ referenceId: req.params.refId.toUpperCase() })
            .populate('doctorId', 'name speciality qualification');
        
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found. Please check your Reference ID." });
        }
        res.json(appointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all appointments (Admin)
router.get('/admin/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('doctorId', 'name speciality')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new doctor (Admin)
router.post('/doctors', async (req, res) => {
    const { name, speciality, specialityInfo, experience, qualification, availableDays } = req.body;
    
    if (!name || !speciality || !experience || !qualification || !availableDays) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const doctor = new Doctor({
        name,
        speciality,
        specialityInfo,
        experience,
        qualification,
        availableDays
    });

    try {
        const newDoctor = await doctor.save();
        res.status(201).json(newDoctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update doctor information (Admin)
router.put('/doctors/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }
        res.json(doctor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a doctor (Admin)
router.delete('/doctors/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found." });
        }
        
        // Optionally: Cancel all appointments for this doctor? 
        // For now, just delete the doctor.
        
        res.json({ message: "Doctor removed successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete/Cancel an appointment
router.delete('/appointments/:refId', async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({ referenceId: req.params.refId.toUpperCase() });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found." });
        }
        res.json({ message: "Appointment cancelled successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Book an appointment
router.post('/appointments', async (req, res) => {
    const { 
        patientType, patientName, patientLastName, mobileNumber, email, 
        gender, dob, uhid, doctorId, date, time 
    } = req.body;

    // 1. Basic Validation
    if (!doctorId || !date || !time) {
        return res.status(400).json({ message: "Doctor, Date, and Time are required." });
    }

    if (patientType === 'new' && (!patientName || !patientLastName || !mobileNumber)) {
        return res.status(400).json({ message: "Patient Name, Last Name, and Mobile Number are required for new patients." });
    }

    if (patientType === 'existing' && !uhid) {
        return res.status(400).json({ message: "UHID/Mobile Number is required for existing patients." });
    }

    // 2. Date Validation (Check if date is in the past)
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    
    if (appointmentDate < today) {
        return res.status(400).json({ message: "Appointments cannot be booked for past dates." });
    }

    try {
        // 3. Conflict Validation (Check if slot is already booked for this doctor)
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            time
        });

        if (existingAppointment) {
            return res.status(400).json({ message: "This slot is already booked for the selected doctor. Please choose another time." });
        }

        const referenceId = `TRN-${Math.floor(10000 + Math.random() * 90000)}`;

        const appointment = new Appointment({
            patientType,
            patientName,
            patientLastName,
            mobileNumber,
            email,
            gender,
            dob: dob || undefined,
            uhid,
            doctorId,
            date: appointmentDate,
            time,
            referenceId
        });

        const newAppointment = await appointment.save();
        res.status(201).json(newAppointment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
