# 喜欢计数器

## 腾讯云 云函数（SCF）版

## 使用说明

1. 首先需要创建一个云函数，选择 `从头开始` -> `Web函数` -> `运行环境： Nodejs 16.13`，最后点击 下一步（如有其他需求，按需匹配即可）。

2. 创建完毕后，打开云函数的 `函数管理` -> `函数代码`，其中就是熟悉的阉割版 VSCode，新建一个终端，输入以下指令

```shell
rm -rf src && git clone https://hub.fastgit.xyz/colour93/like-stats src && cp src/config.template.json src/config.json
```

3. [修改配置文件](#配置文件)

4. 勾选 `自动安装依赖`，最后选择 `部署`，待部署完毕后即可。（[了解API](#API信息)）

## 配置文件

`config.json`

```json
{
    // redis 连接配置
    // 请注意，一定要选择一个空的db！！！reset 会清空数据！！！
    // 请注意，一定要选择一个空的db！！！reset 会清空数据！！！
    // 请注意，一定要选择一个空的db！！！reset 会清空数据！！！
    "redis": {

        "socket": {
            "host": "127.0.0.1",
            "port": 6379
        },
        "password": "redisPassword",
        "database": 1

    },

    // 计次规则
    "rules": {

        // 可单选，可多选，不可不选
        // ip：基于IP
        // session：基于 express-session
        "type": [
            "ip",
            "session"
        ],

        // session 配置（若未选择该模式，则可不存在）
        "session": {
            // session 的 secret（请不要默认，记得随机生成）
            "secret": "sessionSecret",
            // 过期时间（天）
            "expired": 30
        },

        // ip 配置（若未选择该模式，则可不存在）
        "ip": {
            // 过期时间（天）
            "expired": 30
        }
    },

    // 管理配置
    "manage": {

        // 鉴权密钥（请不要默认，记得随机生成）
        "authKey": "manageKey"

    }
}
```

### API信息

#### 总览

所有 POST 方法使用 JSON 载荷

| 路径 | 方法 | 鉴权 | 作用 |
| :-- | :--- | :--: | :---|
| / | GET | | 获取总览数据 |
| /like | POST | | 进行喜欢操作 |
| /set | POST | √ | 设置当前数据 |
| /reset | POST | √ | 重置所有数据 |

#### 响应体通用结构

根对象

| 字段 | 类型 | 作用 |
| :-- | :--  | :-- |
| code | number | [状态码](#状态码) |
| msg | string \| null | 错误信息 |
| data | object | 返回数据对象 |

data 对象（是的，目前 data 对象结构统一）

| 字段 | 类型 | 作用 |
| :-- | :--  | :-- |
| total | string | 总喜欢量 |
| liked | boolean | 当前用户喜欢状态 |

#### 请求体鉴权结构

只需在请求的数据体中加上 `authKey` 即可

```json
{
    "authKey": "hereIsAuthKey"
}
```


#### GET /

返回示例

```json
{
    "code": 0,
    "msg": null,
    "data": {
        "total": 1,
        "liked": true
    }
}
```

#### POST /like

返回示例

```json
{
    "code": 0,
    "msg": "点赞完成了喵",
    "data": {
        "total": 2,
        "liked": true
    }
}
```

#### POST /set

请求体示例

```json
{
    "authKey": "hereIsAuthKey",
    "count": 10
}
```

| 字段 | 类型 | 必选 | 作用 |
| :-- | :--  | :--: | :-- |
| count | number | √ | 设置的数量 |

响应体示例

```json
{
    "code": 0,
    "msg": null,
    "data": {
        "total": 10,
        "liked": false
    }
}
```

#### POST /reset

请求体示例

```json
{
    "authKey": "hereIsAuthKey"
}
```

响应体示例

```json
{
    "code": 0,
    "msg": null
}
```

#### 状态码

这里只说明大致含义，具体返回错误的状态码时，也将返回错误信息

*HTTP状态码改变：指是否同步修改HTTP状态码（不修改则默认200）

| 状态码 | HTTP状态码改变* | 大致含义 |
| :-- | :--: | :-- |
| 0 | | 成功 |
| 400 | √ | 参数错误 |
| 401 | √ | 无权访问 |
| 403 | √ | 操作拒绝 |
| 500 | √ | 服务端错误 |