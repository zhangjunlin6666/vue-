/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-11 22:14:31
 */
/* @flow */

import { inBrowser } from './dom' // 是否在浏览器中
import { saveScrollPosition } from './scroll'

export const supportsPushState = inBrowser && (function () {
  const ua = window.navigator.userAgent // 获取客户端的代理对象

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && // 是安卓2. 或者4.0
    ua.indexOf('Mobile Safari') !== -1 && // 是手机Safari浏览器
    ua.indexOf('Chrome') === -1 && // 非Chrome浏览器
    ua.indexOf('Windows Phone') === -1 // 非Windows Phone手机
  ) {
    return false
  }

  return window.history && 'pushState' in window.history // 支持h5 history api
})()

// use User Timing api (if present) for more accurate key precision
const Time = inBrowser && window.performance && window.performance.now
  ? window.performance
  : Date

let _key: string = genKey()

function genKey (): string {
  return Time.now().toFixed(3)
}

export function getStateKey () {
  return _key
}

export function setStateKey (key: string) {
  _key = key
}

export function pushState (url?: string, replace?: boolean) {
  saveScrollPosition()
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  const history = window.history
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url)
    } else {
      _key = genKey()
      history.pushState({ key: _key }, '', url)
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url)
  }
}

export function replaceState (url?: string) {
  pushState(url, true)
}
