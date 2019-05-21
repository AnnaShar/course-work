const doRequest = require('request-promise-native');
const config = require('../config/' + (process.env.NODE_ENV || 'development'));
const customError = require('./customError');

exports.send = (phone, text) => {
    const options = {
        url: 'http://sms.ru/sms/send',
        method: 'GET',
        qs: {
            to: phone,
            from: 'Customer Authorization',
            text: text,
            api_id: config.sms.api_id,
            test: config.sms.test
        }
    };
    return doRequest(options)
        .then(result => {
            let responseCode = result.split('\n')[0];
            if(responseCode != '100')
                return Promise.reject(new customError(
                    `Ошибка отправки смс, код ошибки: ${responseCode}`));
            return Promise.resolve();
        })
};

exports.sendImitate = (phone, text) => {
    console.log('Sending sms code')
    console.log('phone number - '+ phone);
    console.log('code - '+text);
    console.log('************************');
};