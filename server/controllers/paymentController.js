const axios = require('axios');
const User = require('../../models/User');
require('dotenv').config();

// Initialize Paystack payment
exports.initiatePayment = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount.' });
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/login');
        }

        const paystackResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: user.email,
            amount: amount * 100 // Paystack expects the amount in kobo
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        res.redirect(paystackResponse.data.data.authorization_url);
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ error: 'An error occurred while initiating payment.' });
    }
};

// Verify Paystack payment
exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;

    try {
        const verificationResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        const { status, amount } = verificationResponse.data.data;
        const user = await User.findById(req.session.user._id);

        if (status === 'success' && user) {
            // Credit user's account
            user.balance += amount / 100; // Convert amount from kobo to Naira
            user.transactions.push({
                type: 'Fund Account',
                amount: amount / 100,
                date: new Date()
            });
            await user.save();
            return res.redirect('/dashboard');
        }

        res.status(400).json({ error: 'Payment verification failed.' });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'An error occurred while verifying payment.' });
    }
};