const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: String, default: 'CSE' },
    year: { type: Number, default: 1 },
    phone: { type: String },
    busNumber: { type: Number },
    boardingStop: { type: String },
    pickupTime: { type: String },
    passStatus: { type: String, default: 'active' },
    role: { type: String, default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);