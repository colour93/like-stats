// router

const express = require('express');
const { rules, manage } = require('./config.json');
const { client } = require('./redis');

// 初始化路由
const router = express.Router();

// 获取总览
router.get('/', async (req, res) => {

    res.send({
        code: 0,
        msg: null,
        data: await getLikeStats(req)
    })

});

// 喜欢的操作
router.post('/like', async (req, res) => {

    let liked = await getLikeStatus(req);

    // 如果点过赞
    if (liked) {

        res.status(403).send({
            code: 403,
            msg: "已经点过赞了喵"
        })

    } else {

        // session
        if (rules.type.includes('session')) req.session.liked = 1;
        // ip
        if (rules.type.includes('ip')) {
            let result1, result2;
            result1 = await client.set(`ip:${req.ip}`, 1);
            result2 = await client.expire(`ip:${req.ip}`, (rules.ip?.expired || 30) * 24 * 60 * 60);
            if (!result1 || !result2) {
                console.error("redis 操作出错");
                res.status(500).send({
                    code: 500,
                    msg: "服务器出现错误了喵"
                });
                return;
            }
        }

        let result = await client.incr('stats');
        if (!result) {
            console.error("redis 操作出错");
            res.status(500).send({
                code: 500,
                msg: "服务器出现错误了喵"
            });
            return;
        }

        res.send({
            code: 0,
            msg: "点赞完成了喵",
            data: await getLikeStats(req)
        })

    }

});

// 设置数据
router.post('/set', authMiddleware, async (req, res) => {

    const { count } = req.body;

    if (typeof(count) != 'number') {
        res.status(400).send({
            code: 400,
            msg: "参数错误"
        });
        return;
    }

    let result = await client.set('stats', count);
    if (!result) {
        console.error("redis 操作出错");
        res.send({
            code: 500,
            msg: "服务器出错了喵"
        });
        return;
    }

    res.send({
        code: 0,
        msg: null,
        data: await getLikeStats(req)
    })

});

// 重置数据
router.post('/reset', authMiddleware, async (req, res) => {

    result = await client.flushDb();
    if (result != 'OK') {
        res.send({
            code: 500,
            msg: "擦除当前DB失败喵"
        });
        return;
    }
    result = await client.set('stats', 0);
    if (result != 'OK') {
        res.send({
            code: 500,
            msg: "擦除后写入新的stats失败喵"
        });
        return;
    }

    res.send({
        code: 0,
        msg: null
    })

});

module.exports = router;

/**
 * authKey 鉴权 中间件
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
async function authMiddleware(req, res, next) {
    const { authKey } = req.body;
    if (!authKey || authKey != manage.authKey) {
        res.status(401).send({
            code: 401,
            msg: "无权操作喵"
        });
        return;
    }
    next();
}


/**
 * 获取 喜欢 数据总览
 * @param {express.Request} req 
 * @returns 
 */
async function getLikeStats(req) {
    return {
        total: parseInt(await client.get('stats')),
        liked: await getLikeStatus(req)
    }
}

/**
 * 获取该用户 喜欢 状态
 * @param {express.Request} req 
 * @returns 
 */
async function getLikeStatus(req) {

    let flag = 0;

    // session
    if (rules.type.includes('session') && req.session?.liked) flag++;
    // ip
    if (rules.type.includes('ip')) {
        result = await client.exists(`ip:${req.ip}`);
        if (result) flag++;
    }

    return flag ? true : false;

}