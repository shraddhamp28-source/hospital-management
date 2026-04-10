const connectToDatabase = require('../server/config/db');
const Doctor = require('../server/models/Doctor');

module.exports = async (req, res) => {
    try {
        await connectToDatabase();
    } catch (dbErr) {
        console.error('Database connection error:', dbErr);
        return res.status(500).json({ message: "Database connection failed." });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const doctors = await Doctor.find();
            return res.status(200).json(doctors);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    if (req.method === 'POST') {
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing." });
        }
        const { name, speciality, specialityInfo, experience, qualification, availableDays } = req.body;
        
        if (!name || !speciality || !experience || !qualification || !availableDays) {
            return res.status(400).json({ message: "All fields (name, speciality, experience, qualification, availableDays) are required." });
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
            return res.status(201).json(newDoctor);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    if (req.method === 'PUT') {
        if (!id) return res.status(400).json({ message: "Doctor ID is required." });
        if (!req.body) {
            return res.status(400).json({ message: "Request body is missing." });
        }
        try {
            const doctor = await Doctor.findByIdAndUpdate(id, req.body, { new: true });
            if (!doctor) {
                return res.status(404).json({ message: "Doctor not found." });
            }
            return res.status(200).json(doctor);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ message: "Doctor ID is required." });
        try {
            const doctor = await Doctor.findByIdAndDelete(id);
            if (!doctor) {
                return res.status(404).json({ message: "Doctor not found." });
            }
            return res.status(200).json({ message: "Doctor removed successfully." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
};
