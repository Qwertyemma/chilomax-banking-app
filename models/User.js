const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  balance: {
    type: Number,
    default: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['Data Purchase', 'Airtime Purchase','Withdrawal', 'Deposit', 'Fund Account'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;