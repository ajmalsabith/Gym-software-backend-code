const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema(
  {
    gymId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'trial', 'cancelled'],
      required: true,
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
    subscriptionEndDate: {
      type: Date,
      required: true,
    },
    daysLeft: {
      type: Number,
      default: 0,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
      line1: {
        type: String,
      },
      city: {
        type: String,
      },
      district: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      zip: {
        type: String,
      },
    logo: {
      type: String, 
    },
    phone: {
      type: String,
      match: [/^\+?[0-9\s-]+$/, 'Please enter a valid phone number'],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gym', GymSchema);
