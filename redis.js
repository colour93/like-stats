// redis

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

// 引入配置文件
let redisConfig = require('./config.json').redis;

// 连接Redis
console.log("初始化 Redis 连接");

const client = redis.createClient(redisConfig);
const bucketClient = redis.createClient(Object.assign(redisConfig, {legacyMode: true}));

module.exports = {

    connect () {
        return new Promise (async (resolve, reject) => {

            let flags = { flag: 0 };
            let flag = new Proxy(flags, {
                set: async function(target, property, value) {
                    if (value == 2) {
                        result = await client.get('stats');
                        if (result == undefined) await client.SET('stats', 0);
                        resolve();
                    };
                    return Reflect.set(target, property, value);
                }
            });
        
            bucketClient.connect();
            client.connect();
            
            bucketClient.on('ready', async(e) => {
                console.log('Express-Session Redis 连接成功');
                flag.flag ++;
            })
            bucketClient.on('error', async(err) => {
                console.error(err);
                resolve();
            })
            
            client.on('ready', async(e) => {
                console.log('Redis 连接成功');
                flag.flag ++;
            })
            client.on('error', async(err) => {
                console.error(err);
                resolve();
            })
    
        })
    },

    sessionStore: new RedisStore({
        client: bucketClient
    }),

    client

}