const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Student = require('./models/Student');
const Driver = require('./models/Driver');
const Bus = require('./models/Bus');

const seedData = async () => {
    try {
        // MongoDB Connect
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected!');

        // பழைய data எல்லாம் delete பண்ணு
        await Student.deleteMany({});
        await Driver.deleteMany({});
        await Bus.deleteMany({});
        console.log('🗑️ Old data cleared!');

        // Password hash பண்ணு
        const studentPass = await bcrypt.hash('student123', 10);
        const driverPass = await bcrypt.hash('driver123', 10);

        // Student create பண்ணு
        await Student.create({
            name: 'Sufiyan Ahmed',
            email: 'sufiyan@amet.ac.in',
            password: studentPass,
            studentId: 'AMT2024',
            department: 'CSE',
            year: 2,
            phone: '+91 98765 43210',
            busNumber: 23,
            boardingStop: 'Thiruvanmiyur',
            pickupTime: '07:45',
            passStatus: 'active',
            role: 'student'
        });
        console.log('✅ Student created!');

        // Driver create பண்ணு
        await Driver.create({
            name: 'Rajan Kumar',
            email: 'rajan@amet.ac.in',
            password: driverPass,
            driverId: 'DRV-047',
            phone: '+91 99001 12345',
            busNumber: 23,
            licenseNo: 'TN09-2013-0047',
            experience: 12,
            status: 'on-duty',
            role: 'driver'
        });
        console.log('✅ Driver created!');

        // Bus create பண்ணு
        await Bus.create({
            busNumber: 23,
            driverName: 'Rajan Kumar',
            driverId: 'DRV-047',
            route: 'ECR',
            latitude: 12.8406,
            longitude: 80.2534,
            speed: 0,
            status: 'on-time',
            passengerCount: 0,
            delayReason: ''
        });
        console.log('✅ Bus created!');

        console.log('');
        console.log('🎉 All seed data inserted successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log('Student : sufiyan@amet.ac.in / student123');
        console.log('Driver  : rajan@amet.ac.in / driver123');
        process.exit(0);

    } catch (err) {
        console.log('❌ Error:', err.message);
        process.exit(1);
    }
};

seedData();