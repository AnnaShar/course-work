const express = require('express');
const router = express.Router();
const smsCode = require('../repo/smsCodeRepository');
const user = require('../repo/userRepository');
const sms = require('../libs/smsLib');
const customError = require('../libs/customError');
const passport = require('passport');
const passwValidator = require('password-validator');
const utils = require('../libs/utils');


router.get('/', function (req, res){
    if (req.isAuthenticated()) {
        res.redirect('/customer/home');
    }
    else {
        res.render('authorization-page');
    }
});

router.get('/signup', function (req, res) {
    res.render('signup.hbs');
});

router.get('/signup/check-code', (req, res, next)=>{
    res.render('check-code', {
            phone: req.body.phone
        });
});

router.post('/signup', (req, res, next) =>
    user.checkCustomerAbsence(utils(req.body.phone))
        .then(() => smsCode.remove(utils(req.body.phone)))
        .then(() => smsCode.add(utils(req.body.phone)))
        .then(code  => sms.sendImitate(utils(req.body.phone), code)) //TODO не забыть поставить нормалную отправку
        .then(() => res.render('check-code', {
            phone: req.body.phone
        }))
        .catch(err => {
            res.render('signup', {errorMessage: err.sqlMessage});
        }));


router.post('/signup/checkcode', (req, res, next) => {
        smsCode.get(utils(req.body.phone), req.body.code)
            .then(result => {
                if (!result) return Promise.reject(new customError('You put a wrong code. Please, try again.', 400));
                return res.render('registration', {
                    phone: req.body.phone,
                    code: req.body.code
                });
            })
            .then(() => smsCode.remove(utils(req.body.phone)))
            .catch(err => res.render('check-code', {errorMessage: err.message, phone: req.body.phone})
            )
});

router.post('/signup/registration', (req, res, next) =>{
    if (!schema.validate(req.body.password)){
        res.render('registration', {
            phone: req.body.phone,
            code: req.body.code,
            name: req.body.name,
            errorMessage: 'Password  is incorrect. Follow instructions about making passwords.'
        });
        return;
    }
    if (req.body.password===req.body.repeatPassword){
    user.register(req.body, 'customer')
        .then(() => smsCode.remove(utils(req.body.phone)))
        .then(() =>res.render('finish', {message:'You have been registrated!'}))
             .catch(err => next(err))
    }
    else res.render('registration', {
        phone: req.body.phone,
        code: req.body.code,
        name: req.body.name,
        errorMessage: 'Passwords do not match.'
    });
});

router.post('/login',
    passport.authenticate('login'),
    function(req, res, next) {
        res.render('home');
    },
    function (err, req, res, next){
        let options = {errorMessage: err.sqlMessage};
        if (err.sqlState==='45005')
            options.phone = req.body.phone;
        res.render('login', options);
});

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/customer/home');
    }
    else res.render('login.hbs');
});

router.get('/login/forgotpassword', (req,res)=>{
    res.render('forgot-password', {phone: req.body.phone});
});

router.post('/login/confirmphone', (req, res)=>{
    user.checkPhoneExisting(req.body.phone)
        .then(() => smsCode.remove(utils(req.body.phone)))
        .then(() => smsCode.add(utils(req.body.phone)))
        .then(code  => sms.sendImitate(utils(req.body.phone), code)) //TODO не забыть поставить нормалную отправку
        .then(() => res.render('confirm-phone', {
            phone: req.body.phone
        }))
        .catch(err => {
            res.render('forgot-password', {errorMessage: err.sqlMessage});
})});

router.post('/login/checkcode', (req,res)=>{
    smsCode.get(utils(req.body.phone), req.body.code)
        .then(result => {
            if (!result) return Promise.reject(new customError('You put a wrong code. Please, try again.', 400));
            return res.render('new-password', {
                phone: req.body.phone,
                code: req.body.code
            });
        })
        .then(() => smsCode.remove(utils(req.body.phone)))
        .catch(err => res.render('confirm-phone', {errorMessage: err.message, phone: req.body.phone})
        )
});

router.post('/login/changepassword', (req, res)=>{
    if (!schema.validate(req.body.password)){
        res.render('new-password', {
            phone: req.body.phone,
            code: req.body.code,
            errorMessage: 'Password  is incorrect. Follow instructions about making passwords.'
        });
        return;
    }
    if (req.body.password===req.body.repeatPassword){
        user.changePassword(req.body, 'customer')
            .then(() => smsCode.remove(utils(req.body.phone)))
            .then(() => res.render('finish', {message:'Your password has been changed.'}))
            //res.redirect('/customer/login')) //TODO добавить сообщение про то, что регистарция прошла успешно
            .catch(err => next(err))
    }
    else res.render('new-password', {
        phone: req.body.phone,
        code: req.body.code,
        errorMessage: 'Passwords do not match.'
    });
});

router.get('/home', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/customer');
}, function(req, res){
    res.render('home');
});

router.get('/account/changepassword', (req, res)=>{
    //let phone = req.signedCookie['phone'];
    res.render('change-password', {phone:phone});
});

router.get('/logout', (req, res) => {
    req.logout();                                 // [1]
    req.session.destroy(() => res.redirect('/customer'));         // [2]
});

router.get('/*', (req, res)=>{
    res.redirect('/customer');
});


const schema = new passwValidator();
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces
module.exports = router;