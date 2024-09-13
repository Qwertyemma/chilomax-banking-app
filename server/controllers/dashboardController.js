const User = require('../../models/User');
const { hashPassword } = require('../../utils/hashPassword');

// Show dashboard page
exports.showDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/login');
        }

        res.render('dashboard', {
            title: 'Dashboard - Chilomax Bank',
            username: user.username,
            balance: user.balance,
            transactions: user.transactions
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
            title: 'Buy Data - Chilomax Bank',
            balance: user.balance,
            error: req.query.error
        });
    } catch (err) {
        console.error('Error fetching buy data page:', err);
        res.redirect('/dashboard');
    }
};

// Process data purchase
exports.processBuyData = async (req, res) => {
    const { provider, amount } = req.body;

    if (!provider || !amount) {
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

        user.balance -= amount;
        user.transactions.push({
            type: 'Data Purchase',
            amount,
            date: new Date()
        });
        await user.save();

        res.redirect('/dashboard');
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
            title: 'Buy Airtime - Chilomax Bank',
            balance: user.balance,
            error: req.query.error
        });
    } catch (err) {
        console.error('Error fetching buy airtime page:', err);
        res.redirect('/dashboard');
    }
};

// Process airtime purchase
exports.processBuyAirtime = async (req, res) => {
    const { provider, amount } = req.body;

    if (!provider || !amount) {
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

        user.balance -= amount;
        user.transactions.push({
            type: 'Airtime Purchase',
            amount,
            date: new Date()
        });
        await user.save();

        res.redirect('/dashboard');
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
            title: 'Profile - Chilomax Bank',
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
            // Hash the new password before saving
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
        return res.redirect('/dashboard/fund-account?error=All fields are required.'); // Corrected URL
    }

    if (amount <= 0) {
        return res.redirect('/dashboard/fund-account?error=Invalid amount.'); // Corrected URL
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/login');
        }

        // Logic to simulate successful fund (In real application, you'd handle payments here)
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
        res.redirect('/dashboard/fund-account?error=An error occurred. Please try again later.'); // Corrected URL
    }
};