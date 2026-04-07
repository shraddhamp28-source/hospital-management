const connectToDatabase = require('../server/config/db');
const Appointment = require('../server/models/Appointment');

module.exports = async (req, res) => {
    await connectToDatabase();

    const { refId } = req.query;

    if (req.method === 'GET') {
        if (refId) {
            // Get appointment by Reference ID
            try {
                const appointment = await Appointment.findOne({ referenceId: refId.toUpperCase() })
                    .populate('doctorId', 'name speciality qualification');
                
                if (!appointment) {
                    return res.status(404).json({ message: "Appointment not found. Please check your Reference ID." });
                }
                return res.status(200).json(appointment);
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        } else {
            // The frontend doesn't seem to have a "get all appointments" for non-admin
            return res.status(400).json({ message: "Reference ID is required." });
        }
    }

    if (req.method === 'POST') {
        const { 
            patientType, patientName, patientLastName, mobileNumber, email, 
            gender, dob, uhid, doctorId, date, time 
        } = req.body;

        if (!doctorId || !date || !time) {
            return res.status(400).json({ message: "Doctor, Date, and Time are required." });
        }

        if (patientType === 'new' && (!patientName || !patientLastName || !mobileNumber)) {
            return res.status(400).json({ message: "Patient Name, Last Name, and Mobile Number are required for new patients." });
        }

        if (patientType === 'existing' && !uhid) {
            return res.status(400).json({ message: "UHID/Mobile Number is required for existing patients." });
        }

        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (appointmentDate < today) {
            return res.status(400).json({ message: "Appointments cannot be booked for past dates." });
        }

        try {
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
            return res.status(201).json(newAppointment);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    if (req.method === 'DELETE') {
        if (!refId) return res.status(400).json({ message: "Reference ID is required." });
        try {
            const appointment = await Appointment.findOneAndDelete({ referenceId: refId.toUpperCase() });
            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found." });
            }
            return res.status(200).json({ message: "Appointment cancelled successfully." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
};
