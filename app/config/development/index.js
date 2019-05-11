const config = {
    db : {
        mysql : {
            host     : 'localhost',
            user     : 'root',
            database : 'appdb', // можете заменить 'appdb' на свое название
            password : 'yfghbvth?djn' // замените это на root пароль
        },                                // от MySQL Server
        mongo : 'mongodb://localhost/ourProject' // можете заменить 'ourProject'
    },                                           // на свое название
    redis : {
        port : 6379,
        host : '127.0.0.1'
    },
    port : 3000,
    sms : {
        api_id : '6E4C6315-99D0-5962-0CF7-4A664E97A0FC', //Выдается при регистрации на sms.ru
        test : 1
    },
    sessionSecret :'secret'
};



module.exports =  config;