const axios = require('axios');
const User = require('../../models/User');
const { hashPassword } = require('../../utils/hashPassword');

// Paystack API credentials
const PAYSTACK_SECRET_KEY = 'sk_test_yourSecretKey';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to make API requests to Paystack
const paystackApiRequest = async (endpoint, method, data = {}) => {
    const config = {
        method,
        url: `${PAYSTACK_BASE_URL}${endpoint}`,
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        data,
    };
    return axios(config);
};

// Generate Paystack Virtual Account
exports.generateVirtualAccount = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        // Check if user already has a virtual account
        if (user.virtualAccountNumber) {
            return res.redirect('/dashboard');
        }

        // Create a new virtual account via Paystack
        const response = await paystackApiRequest('/dedicated_account', 'POST', {
            customer: user.email,
            preferred_bank: 'wema-bank',
            external_reference: `user_${user._id}`,
        });

        if (response.status === 200 && response.data.status === 'success') {
            // Save virtual account details in the database
            user.virtualAccountNumber = response.data.data.account_number;
            user.virtualAccountBank = response.data.data.bank;
            await user.save();

            res.redirect('/dashboard');
        } else {
            return res.redirect('/dashboard/fund-account?error=Virtual account generation failed.');
        }
    } catch (err) {
        console.error('Error generating virtual account:', err);
        res.redirect('/dashboard/fund-account?error=An error occurred. Please try again later.');
    }
};

// VTUExpress API credentials
const VTU_API_TOKEN = '66f2e5c39ac8640f13cd888f161385b12f7e5e92';
const VTU_BASE_URL = 'https://vtuexpress.com/api/';

// Helper function to make API requests to VTUExpress
const vtuApiRequest = async (endpoint, method, data = {}) => {
    const config = {
        method,
        url: `${VTU_BASE_URL}${endpoint}`,
        headers: {
            Authorization: `Token ${VTU_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        data,
    };
    return axios(config);
};
// Show dashboard page
exports.showDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('dashboard', {
            title: 'Dashboard - Chilomax VTU Service',
            username: user.username,
            balance: user.balance,
            transactions: user.transactions,
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.redirect('/login');
    }
};

// Show buy data page
exports.showBuyDataPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('buy-data', {
            title: 'Buy Data - Chilomax VTU Service',
            balance: user.balance,
            error: req.query.error,
        });
    } catch (err) {
        console.error('Error fetching buy data page:', err);
        res.redirect('/dashboard');
    }
};

// Process data purchase
exports.processBuyData = async (req, res) => {
    const { provider, plan, mobile_number, } = req.body;

    if (!provider || !plan || !mobile_number || !amount) {
        return res.redirect('/dashboard/buy-data?error=All fields are required.');
    }

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        // Check if user has sufficient balance
        if (user.balance < amount) {
            return res.redirect('/dashboard/buy-data?error=Insufficient balance.');
        }

        // Make VTUExpress API call for data purchase
        const vtuResponse = await vtuApiRequest('data/', 'POST', {
            network: provider,
            mobile_number,
            plan,
            Ported_number: true,
        });

        if (vtuResponse.status === 200 && vtuResponse.data.success) {
            // Deduct balance and record transaction
            user.balance -= amount;
            user.transactions.push({
                type: 'Data Purchase',
                amount:plan,
                mobile_number,
                provider,
                plan,
                date: new Date(),
            });
            await user.save();
            res.redirect('/dashboard');
        } else {
            return res.redirect('/dashboard/buy-data?error=Data purchase failed. Please try again.');
        }
    } catch (err) {
        console.error('Error processing data purchase:', err);
        res.redirect('/dashboard/buy-data?error=An error occurred. Please try again later.');
    }
};

// Show buy airtime page
exports.showBuyAirtimePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('buy-airtime', {
            title: 'Buy Airtime - Chilomax VTU Service',
            balance: user.balance,
            error: req.query.error,
        });
    } catch (err) {
        console.error('Error fetching buy airtime page:', err);
        res.redirect('/dashboard');
    }
};

// Process airtime purchase
exports.processBuyAirtime = async (req, res) => {
    const { provider, mobile_number, amount } = req.body;

    if (!provider || !mobile_number || !amount) {
        return res.redirect('/dashboard/buy-airtime?error=All fields are required.');
    }

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        // Check if user has sufficient balance
        if (user.balance < amount) {
            return res.redirect('/dashboard/buy-airtime?error=Insufficient balance.');
        }

        // Make VTUExpress API call for airtime purchase
        const vtuResponse = await vtuApiRequest('airtime/', 'POST', {
            network: provider,
            mobile_number,
            amount,
            Ported_number: true,
        });

        if (vtuResponse.status === 200 && vtuResponse.data.success) {
            // Deduct balance and record transaction
            user.balance -= amount;
            user.transactions.push({
                type: 'Airtime Purchase',
                amount,
                mobile_number,
                provider,
                date: new Date(),
            });
            await user.save();
            res.redirect('/dashboard');
        } else {
            return res.redirect('/dashboard/buy-airtime?error=Airtime purchase failed. Please try again.');
        }
    } catch (err) {
        console.error('Error processing airtime purchase:', err);
        res.redirect('/dashboard/buy-airtime?error=An error occurred. Please try again later.');
    }
};
// Show profile page
exports.showProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('profile', {
            title: 'Profile - Chilomax VTU Service',
            username: user.username,
            email: user.email
        });
    } catch (err) {
        console.error('Error fetching profile page:', err);
        res.redirect('/dashboard');
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        user.username = username;
        user.email = email;
        if (password) {
            user.password = await hashPassword(password);
        }
        await user.save();
        res.redirect('/dashboard/profile');
    } catch (err) {
        console.error('Error updating profile:', err);
        res.redirect('/dashboard/profile?error=An error occurred. Please try again later.');
    }
};

// Show all transactions
exports.showTransactions = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('transactions', {
            title: 'Transactions - Chilomax Bank',
            transactions: user.transactions
        });
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.redirect('/dashboard');
    }
};

// Show transaction details
exports.showTransactionDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        const transaction = user.transactions.id(id);
        if (!transaction) {
            return res.redirect('/dashboard/transactions');
        }
        res.render('transaction-details', {
            title: 'Transaction Details - Chilomax Bank',
            transaction
        });
    } catch (err) {
        console.error('Error fetching transaction details:', err);
        res.redirect('/dashboard/transactions');
    }
};

// Show fund account page
exports.showFundAccount = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('fund-account', {
            title: 'Fund Account - Chilomax Bank',
            balance: user.balance,
            error: req.query.error
        });
    } catch (err) {
        console.error('Error fetching fund account page:', err);
        res.redirect('/dashboard');
    }
};

// Process fund account form
exports.processFundAccount = async (req, res) => {
    const { bank, amount } = req.body;
    if (!bank || !amount) {
        return res.redirect('/dashboard/fund-account?error=All fields are required.');
    }
    if (amount <= 0) {
        return res.redirect('/dashboard/fund-account?error=Invalid amount.');
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }
        user.balance += parseFloat(amount);
        user.transactions.push({
            type: 'Fund Account',
            amount,
            bank,
            date: new Date()
        });
        await user.save();
        res.redirect('/dashboard');
    } catch (err) {
        console.error('Error processing fund account:', err);
        res.redirect('/dashboard/fund-account?error=An error occurred. Please try again later.');
    }
};


// Show fund account page with unique account number
exports.showFundAccount = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.redirect('/login');
        }

        // Render the fund account page with unique account number
        res.render('fund-account', {
            title: 'Fund Account - Chilomax Bank',
            balance: user.balance,
            error: req.query.error,
            userAccountNumber: user.accountNumber, // Unique account number for this user
            bankName: 'XYZ Bank', // Bank for transferring to
        });
    } catch (err) {
        console.error('Error fetching fund account page:', err);
        res.redirect('/dashboard');
    }
};

// Webhook for funding wallet
exports.fundAccountWebhook = async (req, res) => {
    try {
        const { event, data } = req.body;

        // Validate incoming webhook event
        if (event !== 'dedicated_account.transaction') {
            return res.status(400).json({ error: 'Invalid event type.' });
        }

        // Extract necessary information from the webhook payload
        const { account_number, amount, reference } = data;

        // Validate webhook data
        if (!account_number || !amount || !reference) {
            return res.status(400).json({ error: 'Invalid data received.' });
        }

        // Find the user by virtual account number
        const user = await User.findOne({ virtualAccountNumber: account_number });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update the user's balance and log the transaction
        user.balance += parseFloat(amount) / 100; // Convert amount from kobo to naira
        user.transactions.push({
            type: 'Fund Account',
            amount: parseFloat(amount) / 100, // Convert amount from kobo to naira
            reference,
            date: new Date(),
        });

        // Save the updated user data
        await user.save();

        // Respond to acknowledge successful processing
        res.status(200).json({ success: true, message: 'Wallet funded successfully.' });
    } catch (err) {
        console.error('Error processing fund account webhook:', err);
        res.status(500).json({ error: 'An error occurred.' });
    }
};