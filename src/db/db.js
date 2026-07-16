const mongoose = require('mongoose');
require("dotenv").config();


async function connectDB() {
  
        // Connect to MongoDB till .net its the connection string and synapse is the database name
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB');
}

connectDB()

module.exports = connectDB;