// ../../utils/hashPassword.js
const bcrypt = require('bcryptjs');

const saltRounds = 10;

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (err) {
        throw new Error('Error hashing password');
    }
}

module.exports = { hashPassword };