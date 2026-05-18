const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri) {
      console.log('\n⚠️  No MONGODB_URI detected in env vars');
      console.log('🚀 Provisioning local self-contained in-memory MongoDB Server...');
      
      mongod = await MongoMemoryServer.create({
        binary: {
          version: "7.0.14"
        },
        instance: {
          startupTimeout: 120000
        }
      });
      dbUri = mongod.getUri();
      console.log(`✅ In-Memory MongoDB Server running: ${dbUri}`);
    }

    const conn = await mongoose.connect(dbUri);
    console.log(`🔌 MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('🔌 MongoDB connection closed successfully');
  } catch (error) {
    console.error('❌ Error shutting down MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
