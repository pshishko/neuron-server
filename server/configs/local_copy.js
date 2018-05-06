var Server = Server || {};

Server.Config = function() {
    return {
        serverPath  : __dirname + '/../../',
        port        : 3113,
        ssl: {
            enabled : true,
            key     : '/var/www/html/skeleton/.ssl/file.pem',
            cert    : '/var/www/html/skeleton/.ssl/file.crt'
        },
        apiUrl      : 'http://dev.thebrain4web.com/dimon/skeleton-api/api/web',
        auth: {
            client_id       : 'app-id',
            client_secret   : 'app-secret'
        },
        cryptKey    : '123someSecretKey123',
        consoleLog  : 1,    // 1 - on, 0 - off
    };
}();

var module = module || {};
module ? module.exports = Server.Config : '';