const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Middleware — Token check பண்ணு
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token!' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token!' });
    }
};

// GET /api/student/profile — Student profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('-password');
        if (!student) {
            return res.status(404).json({
                message: 'Student not found'
            });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/student/all — எல்லா students (Admin)
router.get('/all', async (req, res) => {
    try {
        const students = await Student.find()
            .select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/student/bus/:number — Bus-ல உள்ள students
router.get('/bus/:number', async (req, res) => {
    try {
        const students = await Student.find({
            busNumber: req.params.number
        }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;