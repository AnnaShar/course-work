const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const randomStr = require('randomstring');

const smsCodeSchema = new Schema({
    code: {
        type: String,
        default: () => randomStr.generate({length: 6, readable: true})
    },
    phone: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120
    }
});

module.exports = mongoose.model('smsCode', smsCodeSchema);