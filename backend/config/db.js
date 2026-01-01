const mongoose = require('mongoose');

const CONN_STRING = process.env.MONGO_URL;
if(!CONN_STRING) console.log("No connection string")
console.log(CONN_STRING)

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(CONN_STRING);
        console.log(`MongoDB Connected: ${conn.connection.host}, Database: ${conn.connection.name}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Export the connectDB function using CommonJS syntax
module.exports = connectDB;
