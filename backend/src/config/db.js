const mongoose = require('mongoose');

const connectDb = async () => {
  // Use local MongoDB by default, can be overridden with MONGODB_URI env variable
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/streeteye';

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('MongoDB already connected');
    return;
  }
  
  try {
    console.log('Attempting MongoDB connection to:', uri.replace(/\/\/.*@/, '//***@')); // Hide credentials in log
    const connectionPromise = mongoose.connect(uri, {
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 10000, // 10 second socket timeout
    });
    
    // Add overall timeout
    await Promise.race([
      connectionPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      ),
    ]);
    
    console.log('MongoDB connected successfully to local database');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Server will continue running. MongoDB operations will fail until connection is established.');
    // Don't exit - let the server continue
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDb;


