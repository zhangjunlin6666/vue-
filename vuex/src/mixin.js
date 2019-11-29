/*
 * @Author: jackson
 * @Date: 2019-10-16 17:00:14
 * @LastEditors: jackson
 * @LastEditTime: 2019-11-04 11:38:55
 */

export default function (Vue) {
  // 获取vue版本
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    // 2.0就使用vue.mixin挂载$store
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    // 1.0就扩展vue的初始化函数_init
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    const options = this.$options // 获取vue的配置选项
    // store injection 
    // 根实例是否有store配置
    if (options.store) {
      // 给根实例挂载$store属性
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      // 给子组件挂载$store属性
      this.$store = options.parent.$store
    }
  }
}
