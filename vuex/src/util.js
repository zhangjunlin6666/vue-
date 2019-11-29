/*
 * @Author: jackson
 * @Date: 2019-10-16 17:00:14
 * @LastEditors: jackson
 * @LastEditTime: 2019-10-29 14:09:12
 */
/**
 * Get the first item that pass the test
 * by second argument function
 *
 * @param {Array} list
 * @param {Function} f
 * @return {*}
 */
// 过滤数组，并返回第一个元素
export function find (list, f) {
  return list.filter(f)[0]
}

/**
 * Deep copy the given object considering circular structure.
 * This function caches all nested objects and its copies.
 * If it detects circular structure, use cached copy to avoid infinite loop.
 *
 * @param {*} obj
 * @param {Array<Object>} cache
 * @return {*}
 */
// 深浅拷贝
export function deepCopy (obj, cache = []) {
  // just return if obj is immutable value
  // 简单类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // if obj is hit, it is in circular structure
  // 在缓存数组中查找是否存在obj，如果存在就返回缓存中的数据
  const hit = find(cache, c => c.original === obj)
  if (hit) {
    return hit.copy
  }

  // 初始化copy
  const copy = Array.isArray(obj) ? [] : {}

  // put the copy into cache at first
  // because we want to refer it in recursive deepCopy
  
  // 将obj和copy放进缓存中
  cache.push({
    original: obj,
    copy
  })

  // 循环遍历obj，并将obj拷贝给copy
  Object.keys(obj).forEach(key => {
    // 递归调用
    copy[key] = deepCopy(obj[key], cache)
  })

  return copy
}

/**
 * forEach for object
 */
// 循环遍历对象的key值，并将value和key传递给回调函数
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

// 判断是否是对象
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

// 判断是否是promise
export function isPromise (val) {
  return val && typeof val.then === 'function'
}

// 错误抛出
export function assert (condition, msg) {
  if (!condition) throw new Error(`[vuex] ${msg}`)
}

export function partial (fn, arg) {
  return function () {
    return fn(arg)
  }
}
