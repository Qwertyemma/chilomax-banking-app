const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  accountNumber: { 
    type: String, 
    unique: true, 
    required: true
  }, // Unique account number for each user
  virtualAccountNumber: { 
    type: String, 
    default: null 
  },
  virtualAccountBank: { 
    type: String, 
    default: null 
  },
  transactions: [{
    type: {
      type: String,
      enum: ['Data Purchase', 'Airtime Purchase', 'Withdrawal', 'Deposit'],
      required: true
    },
    amount: { 
      type: Number, 
      required: true 
    },
    provider: String,  // Optional, for mobile services like airtime/data
    mobile_number: String,  // Optional for mobile-related transactions
    plan: String,  // Optional, if the transaction involves a specific plan
    bank: String,  // Optional, for bank-related transactions
    reference: String,  // For transaction tracking
    date: { 
      type: Date, 
      default: Date.now 
    }
  }],
  bankTransfers: [{
    amount: { 
      type: Number 
    },
    transactionId: { 
      type: String 
    },
    bankName: { 
      type: String 
    },
    confirmed: { 
      type: Boolean, 
      default: false 
      default: false 
    },
    date: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);