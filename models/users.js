const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: null,
  },
  email: {
    type: String,
    required: false,
    unique: false,
    default: null,
  },
  leetcodeUsername: {
    type: String,
    required: false,
    default: null,
  },
  step: {
    type: String,
    enum: ['askEmail', 'askLeetCodeUsername', 'askWhatsAppNumber', 'askReminderFrequency', 'completed'],
    default: 'askEmail'
  },
  // Messaging Contact Info
  telegramChatId: {
    type: String,
    default: null,
    unique: true,
    sparse: true  // Allows multiple null values (important for flexibility)
  },
  whatsappNumber: {
    type: String,
    default: null,
  },

  // Reminder Preferences
  reminders: {
    potd: {
      type: Boolean,
      default: false,
    },
    weekly: {
      type: Boolean,
      default: false,
    },
    biweekly: {
      type: Boolean,
      default: false,
    },
  },

  // Frequency of reminder notifications
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'once'],
    default: 'daily',
  },

  // Reminder status tracking
  reminderStatus: {
  
    lastRemindedAt: {
      type: Date,
      default: null
    },
    lastPOTDSolvedTitle: {
      type: String,
      default: "Not set"
    }
  },
  
  // User activity tracking
  lastActive: {
    type: Date,
    default: Date.now,
  },
  
  // Bot interaction status
  isActive: {
    type: Boolean,
    default: true,
  },

  // Created & Updated Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update timestamps
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  this.lastActive = Date.now();
  next();
});

// Method to format user profile for display
userSchema.methods.getFormattedProfile = function() {
  const profile = {
    name: this.name || 'Not set',
    email: this.email || 'Not set',
    leetcodeUsername: this.leetcodeUsername || 'Not set',
    whatsappNumber: this.whatsappNumber || 'Not set',
    frequency: this.frequency || 'Not set',
    setupComplete: this.step === 'completed',
    lastReminded: this.reminderStatus?.lastRemindedAt ? new Date(this.reminderStatus.lastRemindedAt).toLocaleString() : 'Never',
    lastPOTDSolved: this.reminderStatus?.lastPOTDSolved ? new Date(this.reminderStatus.lastPOTDSolved).toLocaleString() : 'Never'
  };
  
  return profile;
};

module.exports = mongoose.model("User", userSchema);