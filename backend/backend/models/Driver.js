const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    driverId: { type: String, required: true, unique: true },
    phone: { type: String },
    busNumber: { type: Number },
    licenseNo: { type: String },
    experience: { type: Number, default: 0 },
    status: {
        type: String,
        default: 'off-duty',
        enum: ['on-duty', 'off-duty', 'leave']
    },
    role: { type: String, default: 'driver' }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);