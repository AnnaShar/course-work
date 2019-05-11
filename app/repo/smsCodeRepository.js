const MODEL_PATH = '../models/';
const smsCode = require(MODEL_PATH+'smsCodeModel');


exports.add = phone => smsCode.create({phone}).then(result => result.code);
exports.get = (phone, code) => smsCode.findOne({phone, code});
exports.remove = phone => smsCode.remove({phone});