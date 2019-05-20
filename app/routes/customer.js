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

// router.post('/signup', (req, res, next) =>{
//     if(user.checkCustomerAbsence(req.body.phone)){
//         console.log('test 1');
//         let code = smsCode.add(req.body.phone);
//         if (code) {
//             console.log('test 2');
//             sms.sendImitate(req.body.phone, code);
//         }
//         console.log('test 3');
//
//         res.render('check-code');
//     }},
//     (err, req, res, next) => {
//         res.render('signup', {errorMessage: err.message });
// });

router.get('/signup/check-code', (req, res, next)=>{
    res.render('check-code', {
            phone: req.body.phone
        });
});

router.post('/signup', (req, res, next) =>
    user.checkCustomerAbsence(req.body.phone)
        .then(() => smsCode.add(req.body.phone))
        .then(code  => sms.sendImitate(req.body.phone, code)) //TODO не забыть поставить нормалную отправку
        .then(() => res.render('check-code', {
            phone: req.body.phone
        }))
        .catch(err => {
            res.render('signup', {errorMessage: err.sqlMessage});
        }));


router.post('/signup/checkcode', (req, res, next) => {
    // if (req.body.phone && req.body.code) {
        smsCode.get(req.body.phone, req.body.code)
            .then(result => {
                if (!result) return Promise.reject(new customError('You put a wrong code. Please, try again.', 400));
                return res.render('registration', {
                    phone: req.body.phone,
                    code: req.body.code
                });
            })
            .then(() => smsCode.remove(req.body.phone))
            .catch(err => res.render('check-code', {errorMessage: err.message, phone: req.body.phone})
            )
    // }
    // else res.redirect('/customer/signup');
});

// router.get('/signup/checkcode', (req, res, next) => {
//     console.log('hi');
//     res.redirect('/customer/signup');
// });

router.post('/signup/registration', (req, res, next) =>
    // TODO проверка на правильность введенного кода
    user.register(req.body, 'customer')
        .then(() => smsCode.remove(req.body.phone))
        .then(() => res.redirect('/customer/login')) //TODO добавить сообщение про то, что регистарция прошла успешно
             .catch(err => next(err)));


router.post('/login',
    passport.authenticate('login',  {
        failureRedirect: '/customer/login',
        successRedirect: '/customer/home'
    }),
    (err, req, res, next) => {
    res.render('login', {errorMessage: JSON.stringify(err)});
    }
);

router.get('/login', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/customer/home');
    }
    else res.render('login.hbs');
});

router.get('/home', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/customer');
}, function(req, res){
    res.render('home')
});

router.get('/logout', (req, res) => {
    req.logout();                                 // [1]
    req.session.destroy(() => res.redirect('/customer'));         // [2]
});

// router.get('/home', function(req, res){
//     res.render('home');
// });

module.exports = router;