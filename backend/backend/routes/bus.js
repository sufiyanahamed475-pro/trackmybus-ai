const express = require('express');
const router = express.Router();
const Bus = require('../models/Bus');

// GET /api/bus/all — எல்லா buses-உம் கொண்டு வா
router.get('/all', async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/bus/:number — ஒரு bus info
router.get('/:number', async (req, res) => {
    try {
        const bus = await Bus.findOne({
            busNumber: req.params.number
        });
        if (!bus) {
            return res.status(404).json({
                message: 'Bus not found'
            });
        }
        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/bus/:number/location — GPS update
router.patch('/:number/location', async (req, res) => {
    try {
        const { latitude, longitude, speed } = req.body;

        const bus = await Bus.findOneAndUpdate(
            { busNumber: req.params.number },
            {
                latitude,
                longitude,
                speed,
                lastUpdated: new Date()
            },
            { new: true }
        );

        if (!bus) {
            return res.status(404).json({
                message: 'Bus not found'
            });
        }

        res.json({
            message: 'Location updated!',
            bus
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/bus/:number/status — Status update
router.patch('/:number/status', async (req, res) => {
    try {
        const { status, delayReason, passengerCount } = req.body;

        const bus = await Bus.findOneAndUpdate(
            { busNumber: req.params.number },
            { status, delayReason, passengerCount, lastUpdated: new Date() },
            { new: true }
        );

        res.json({
            message: 'Status updated!',
            bus
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/bus/add — New bus add பண்ணு (Admin)
router.post('/add', async (req, res) => {
    try {
        const bus = new Bus(req.body);
        await bus.save();
        res.json({
            message: 'Bus added successfully!',
            bus
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

