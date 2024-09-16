const axios = require('axios');
const User = require('../../models/User');
require('dotenv').config();

// Buy data function
exports.buyData = async (req, res) => {
    const { provider, amount, phone } = req.body;

    if (!provider || !amount || !phone) {
        return res.redirect('/dashboard/buy-data?error=All fields are required.');
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/login');
        }

        if (user.balance < amount) {
            return res.redirect('/dashboard/buy-data?error=Insufficient balance.');
        }

        // Call VTU API to process data purchase
        const vtuResponse = await axios.post('https://vtuexpress.com/api/data/', {
            network: provider,
            mobile_number: phone,
            plan: amount,
            Ported_number: true
        }, {
            headers: {
                Authorization: `Token ${process.env.VTU_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (vtuResponse.data.response_description === 'TRANSACTION SUCCESSFUL') {
            // Deduct balance and log the transaction
            user.balance -= amount;
            user.transactions.push({
                type: 'Data Purchase',
                amount: amount,
                provider: provider,
                phone: phone,
                date: new Date()
            });

            await user.save();
            res.redirect('/dashboard');
        } else {
            return res.redirect(`/dashboard/buy-data?error=${vtuResponse.data.response_description}`);
        }
    } catch (error) {
        console.error('Error processing data purchase:', error);
        return res.redirect('/dashboard/buy-data?error=An error occurred during data purchase.');
    }
};

// Buy airtime function
exports.buyAirtime = async (req, res) => {
    const { provider, amount, phone } = req.body;

    if (!provider || !amount || !phone) {
        return res.redirect('/dashboard/buy-airtime?error=All fields are required.');
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/login');
        }

        if (user.balance < amount) {
            return res.redirect('/dashboard/buy-airtime?error=Insufficient balance.');
        }

        // Call VTU API to process airtime purchase
        const vtuResponse = await axios.post('https://vtuexpress.com/api/airtime/', {
            network: provider,
            mobile_number: phone,
            amount: amount
        }, {
            headers: {
                Authorization: `Token ${process.env.VTU_API_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (vtuResponse.data.response_description === 'TRANSACTION SUCCESSFUL') {
            // Deduct balance and log the transaction
            user.balance -= amount;
            user.transactions.push({
                type: 'Airtime Purchase',
                amount: amount,
                provider: provider,
                phone: phone,
                date: new Date()
            });

            await user.save();
            res.redirect('/dashboard');
        } else {
            return res.redirect(`/dashboard/buy-airtime?error=${vtuResponse.data.response_description}`);
        }
    } catch (error) {
        console.error('Error processing airtime purchase:', error);
        return res.redirect('/dashboard/buy-airtime?error=An error occurred during airtime purchase.');
    }
};