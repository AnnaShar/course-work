const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const randomCode = require('random-number');

const smsCodeSchema = new Schema({
    code: {
        type: String,
        default: () => randomCode({min: 1000, max: 9999, integer: true})
    },
    phone: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60
    }
});

module.exports = mongoose.model('smsCode', smsCodeSchema);