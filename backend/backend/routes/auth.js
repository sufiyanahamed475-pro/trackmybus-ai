const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Driver = require('../models/Driver');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Student check பண்ணு
        let user = await Student.findOne({ email });
        let role = 'student';

        // Student இல்லன்னா Driver check பண்ணு
        if (!user) {
            user = await Driver.findOne({ email });
            role = 'driver';
        }

        // யாரும் இல்லன்னா error
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Password check பண்ணு
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Wrong password'
            });
        }

        // JWT Token create பண்ணு
        const token = jwt.sign(
            { id: user._id, role: role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            role,
            name: user.name,
            email: user.email,
            busNumber: user.busNumber
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/register (Student)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, studentId,
            department, year, phone,
            busNumber, boardingStop, pickupTime } = req.body;

        // Already exists check
        const exists = await Student.findOne({ email });
        if (exists) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        // Password hash பண்ணு
        const hashedPassword = await bcrypt.hash(password, 10);

        const student = new Student({
            name, email,
            password: hashedPassword,
            studentId, department,
            year, phone,
            busNumber, boardingStop, pickupTime
        });

        await student.save();
        res.json({ message: 'Student registered successfully!' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;