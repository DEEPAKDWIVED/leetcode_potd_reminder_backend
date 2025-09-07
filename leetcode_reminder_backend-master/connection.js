const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.set('strictQuery', true);

const connection = async () => {
    try {
        await mongoose.connect(process.env._MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            w: 'majority'
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit the process immediately, try to reconnect
        console.log('Attempting to reconnect in 5 seconds...');
        setTimeout(connection, 5000);
    }
};

module.exports = connection;
