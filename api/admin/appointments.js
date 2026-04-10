const connectToDatabase = require('../../server/config/db');
const Appointment = require('../../server/models/Appointment');

module.exports = async (req, res) => {
    try {
        await connectToDatabase();
    } catch (dbErr) {
        console.error('Database connection error:', dbErr);
        return res.status(500).json({ message: "Database connection failed." });
    }

    if (req.method === 'GET') {
        try {
            const appointments = await Appointment.find()
                .populate('doctorId', 'name speciality')
                .sort({ date: 1, time: 1 });
            return res.status(200).json(appointments);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
};
