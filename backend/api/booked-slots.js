const connectToDatabase = require('../server/config/db');
const Appointment = require('../server/models/Appointment');

module.exports = async (req, res) => {
    await connectToDatabase();

    if (req.method === 'GET') {
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
            
            return res.status(200).json(bookedSlots.map(app => app.time));
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
};
