const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busNumber: { type: Number, required: true, unique: true },
    driverName: { type: String },
    driverId: { type: String },
    route: { type: String },
    latitude: { type: Number, default: 12.8406 },
    longitude: { type: Number, default: 80.2534 },
    speed: { type: Number, default: 0 },
    status: {
        type: String,
        default: 'off-duty',
        enum: ['on-time', 'delayed', 'arrived', 'off-duty']
    },
    passengerCount: { type: Number, default: 0 },
    delayReason: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);