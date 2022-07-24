// express

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

const redis = require('./redis');
const router = require('./router');

const config = require('./config.json');

app.use(express.urlencoded({ extended: false }));

// expres-session
if (config.rules.type.includes('session')) {
    app.use(cookieParser());
    app.use(session({
        saveUninitialized: false,
        resave: true,
        secret: config.rules.session.secret,
        name: 'sid',
        cookie: {
            maxAge: (config.rules.session?.expired || 30) * 24 * 60 * 60 * 1000
        },
        store: redis.sessionStore
    }))
}

app.use(router);

// Error handler
app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send({
        code: 500,
        msg: 'Internal Serverless Error 服务器错误'
    });
});

// Web 类型云函数，只能监听 9000 端口
app.listen(9000, '0.0.0.0', () => {
    console.log(`Express 服务运行于 http://localhost:9000`);
});
