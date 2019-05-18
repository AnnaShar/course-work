const express = require('express');
const router = express.Router();
const smsCode = require('../repo/smsCodeRepository');
const user = require('../repo/userRepository');
const sms = require('../libs/smsLib');
const customError = require('../libs/customError');
const passport = require('passport');

router.get('/', function (req, res){
   res.render('authorization-page');
});

router.get('/signup', function (req, res) {
    res.render('signup.hbs');
});

router.post('/signup', (req, res, next) =>
    user.checkCustomerAbsence(req.body.phone)
        .then(() => smsCode.add(req.body.phone))
        .then(code  => sms.sendImitate(req.body.phone, code)) //TODO не забыть поставить нормалную отправку
        .then(() => res.render('check-code', {
            phone: req.body.phone
        }))
        .catch(err => next(err)));

router.post('/signup/checkcode', (req, res, next) =>
    smsCode.get(req.body.phone, req.body.code)
        .then(result => { if(!result) return Promise.reject(new customError('Wrong code', 400));
            return res.render('registration', {
                phone: req.body.phone,
                code:req.body.code
            }); })
        .then(() => smsCode.remove(req.body.phone))
        .catch(err => res.redirect('/signup')
            .then(next(err))));

router.post('/signup/registration', (req, res, next) =>
    // TODO проверка на правильность введенного кода
    user.register(req.body, 'customer')
        .then(() => smsCode.remove(req.body.phone))
        .then(() => res.redirect('/customer/login')) //TODO добавить сообщение про то, что регистарция прошла успешно
             .catch(err => next(err)));


router.post('/login', (req, res, next) =>
    {req.body.role = 'customer'; next()},
    passport.authenticate('login',  {
        failureRedirect: '/customer/login',
        successRedirect: '/customer/home'
        })
);

router.get('/login', function (req, res){
    res.render('login.hbs');
});

router.get('/home', function (req, res, next) {
    res.render('home');
    // if (req.isAuthenticated()) {
    //     next();
    // }
//     res.redirect('/customer');
// }, function(req, res){res.render('home')});
});

// router.get('/home', function(req, res){
//     res.render('home');
// });

module.exports = router;