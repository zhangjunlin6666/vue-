/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-11 21:05:41
 */
/* @flow */
// 判断是否是在浏览器环境中，即window对象是否存在，存在就是在浏览器中
export const inBrowser = typeof window !== 'undefined'
