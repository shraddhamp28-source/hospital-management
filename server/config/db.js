const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
            console.log('Connected to MongoDB');
            
            // Optional: Seeding logic
            try {
                const count = await Doctor.countDocuments();
                if (count === 0) {
                    const doctorsData = [
                        { name: "Dr. Anil Sharma", speciality: "Cardiology", experience: "20 Years", qualification: "MBBS, MD, DM (Cardiology)", availableDays: "Mon, Wed, Fri" },
                        { name: "Dr. Priya Desai", speciality: "Cardiology", experience: "15 Years", qualification: "MBBS, MD, DNB (Cardiology)", availableDays: "Tue, Thu, Sat" },
                        { name: "Dr. Rajesh Kulkarni", speciality: "Orthopaedics", experience: "25 Years", qualification: "MBBS, MS (Ortho)", availableDays: "Mon to Sat" },
                        { name: "Dr. Sneha Patil", speciality: "Orthopaedics", experience: "12 Years", qualification: "MBBS, DNB (Ortho)", availableDays: "Mon, Wed, Fri" },
                        { name: "Dr. Vikram Singh", speciality: "Neurology", experience: "18 Years", qualification: "MBBS, MD, DM (Neurology)", availableDays: "Tue, Thu" },
                        { name: "Dr. Meena Iyer", speciality: "Oncology", experience: "22 Years", qualification: "MBBS, MD, DM (Medical Oncology)", availableDays: "Mon, Wed, Fri" },
                        { name: "Dr. Rohan Shah", speciality: "Pediatrics", experience: "10 Years", qualification: "MBBS, MD (Pediatrics)", availableDays: "Mon to Sat" },
                        { name: "Dr. Amitav Shukla", speciality: "General Medicine", experience: "30 Years", qualification: "MBBS, MD (Medicine)", availableDays: "Mon, Tue, Thu, Fri" },
                        { name: "Dr. Anjali Verma", speciality: "Neurology", experience: "14 Years", qualification: "MBBS, MD, DM", availableDays: "Wed, Fri, Sat" },
                        { name: "Dr. Bharat Joshi", speciality: "General Medicine", experience: "16 Years", qualification: "MBBS, MD", availableDays: "Tue, Thu, Sat" }
                    ];
                    await Doctor.insertMany(doctorsData);
                    console.log('Database seeded with initial doctors.');
                }
            } catch (seedErr) {
                console.error('Seeding failed:', seedErr);
            }

            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

module.exports = connectToDatabase;
