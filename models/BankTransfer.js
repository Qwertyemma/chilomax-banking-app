const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bank Transfer Schema
const bankTransferSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Export the BankTransfer model
const BankTransfer = mongoose.model('BankTransfer', bankTransferSchema);
module.exports = BankTransfer;