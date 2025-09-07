const mongoose = require('mongoose');

const potdSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to get today's POTD with caching
let potdCache = {
  data: null,
  lastUpdated: null
};

potdSchema.statics.getTodayPOTD = async function() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  
  // Check cache first
  if (potdCache.data && potdCache.lastUpdated && 
      potdCache.lastUpdated.getTime() === now.getTime()) {
    return potdCache.data;
  }
  
  // If not in cache, fetch from DB
  const potd = await this.findOne({ date: now });
  if (potd) {
    potdCache.data = potd;
    potdCache.lastUpdated = now;
  }
  return potd;
};

// Clear cache when new POTD is saved
potdSchema.pre('save', function() {
  potdCache = {
    data: null,
    lastUpdated: null
  };
});

module.exports = mongoose.model('POTD', potdSchema); 