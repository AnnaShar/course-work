const express = require('express');
const router = express.Router();
const smsCode = require('../repo/smsCodeRepository');
const user = require('../repo/userRepository');
const sms = require('../libs/smsLib');
const customError = require('../libs/customError');
const passport = require('passport');

router.post('/login', (req, res, next) => {
    req.body.role = 'customer'; next()},
    passport.authenticate('local'),
    (req, res) => res.end());

router.get('/', function (req, res) {
        res.render('customer.hbs');
});

router.get('/signup', function (req, res) {
    res.render('customer-signup.hbs');
});


router.post('/', (req, res, next) =>
    smsCode.get(req.body.phone, req.body.code)
        .then(result => { if(!result) return Promise.reject(new customError('Wrong code', 400));
            return user.register(req.body, 'customer'); })
        .then(() => smsCode.remove(req.body.phone))
        .then(() => res.end()) .catch(err => next(err)));


router.post('/sms', (req, res, next) =>
    user.checkCustomerAbsence(req.body.phone)
        .then(() => smsCode.add(req.body.phone))
        .then(code  => sms.send(req.body.phone, code))
        .then(() => res.end())
        .catch(err => next(err)));

module.exports = router;