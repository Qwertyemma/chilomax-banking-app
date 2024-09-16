const BankTransfer = require('../../models/BankTransfer');  // Ensure this path is correct
const User = require('../../models/User');  // Ensure this path is correct

// Admin dashboard route handler
exports.dashboard = (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied.');
  }
  res.render('adminDashboard', { title: 'Admin Dashboard' });  // Ensure this view exists
};

// Confirm a transfer and update user's balance
exports.confirmBankTransfer = async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied.');
  }

  const { transferId } = req.body;

  try {
    const transfer = await BankTransfer.findById(transferId).populate('user');
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    if (transfer.status === 'confirmed') {
      return res.status(400).json({ error: 'Transfer already confirmed' });
    }

    // Update user's balance
    transfer.user.balance += transfer.amount;
    await transfer.user.save();

    // Mark transfer as confirmed
    transfer.status = 'confirmed';
    await transfer.save();

    res.status(200).json({ message: 'Transfer confirmed and user balance updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error confirming transfer' });
  }
};

// Get pending transfers
exports.getPendingTransfers = async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Access denied.');
  }

  try {
    const pendingTransfers = await BankTransfer.find({ status: 'pending' }).populate('user');
    res.status(200).json(pendingTransfers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending transfers' });
  }
};