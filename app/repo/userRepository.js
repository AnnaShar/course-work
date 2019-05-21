const mysql = require('../libs/dbs').mysql;
const utils = require('../libs/utils');

exports.checkCustomerAbsence = phone =>
    mysql.query('CALL checkCustomerAbsenceByPhone(?)', [utils(phone)]);

exports.checkPhoneExisting = phone =>
    mysql.query('CALL checkPhoneExisting(?)', [utils(phone)]);

exports.checkSellerAbsence = phone =>
    mysql.query('CALL checkSellerAbsenceByPhone(?)', [utils(phone)]);

exports.register = (body, role) =>
    mysql.query('CALL register(?,?,?,?)', [utils(body.phone), body.name, body.password, role]);

exports.changePassword = (body, role) =>
    mysql.query('CALL changePassword(?,?,?)', [utils(body.phone), body.password, role]);

exports.getByIdAndRole = user =>
    mysql.query(`SELECT a.phone, b.name, b.role_id FROM users a
                 JOIN users_has_roles b ON b.user_id = a.id AND b.role_id = ?
                 WHERE a.id = ?`, [user.roleId, user.id])
        .spread(result => result[0]);

exports.login = body =>
    mysql.query('CALL logIn(?,?,?)', [body.role, utils(body.phone), body.password])
        .spread(result => result[0][0]);