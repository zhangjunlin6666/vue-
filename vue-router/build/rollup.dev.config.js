/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-10 23:49:58
 */
const { input, output } = require('./configs')[0] // 获取config.js配置数组中的第一个配置

module.exports = Object.assign({}, input, { output })
// 这里导出是为了给packjson中的npm run dev:dist打包使用的配置，