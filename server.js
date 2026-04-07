require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./server/routes/api');
const Doctor = require('./server/models/Doctor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// Database connection logic for serverless
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/terna_hospital';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const db = await mongoose.connect(MONGODB_URI);
        cachedDb = db;
        console.log('Connected to MongoDB');
        
        // Seed doctors if the database is empty
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
        
        return cachedDb;
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        throw err;
    }
}

// Middleware to ensure database connection before handling requests
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error: Database Connection Failed" });
    }
});

// Redirect all other requests to index.html (SPA feel)
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
