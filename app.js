// 入口

init();

async function init() {

  const check = require('./check');
  check();

  // 先初始化redis
  const redis = require('./redis');
  await redis.connect();

  // 最后初始化express
  const express = require('./express');

}