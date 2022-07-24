// 检查

const fs = require('fs');

module.exports = () => {

    const configFileExists = fs.existsSync('config.json');
    if (!configFileExists) throw new Error("未找到配置文件");

    const config = require('./config.json');

    if (!config.redis) throw new Error("未找到 redis 配置项");
    if (!config.rules) throw new Error("未找到规则配置项");
    if (!config.manage) throw new Error("未找到管理配置项");

    if (config.rules.type.length == 0) throw new Error("规则配置项 type 不能为空");
    if (config.rules.type.includes('session') && config.rules.session.secret == 'sessionSecret') throw new Error("session secrect 不能为默认值");
    if (config.manage.authKey == 'manageKey') throw new Error("管理密码不能为默认值")

}