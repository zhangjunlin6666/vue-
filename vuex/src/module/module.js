/*
 * @Author: jackson
 * @Date: 2019-10-16 17:00:14
 * @LastEditors: jackson
 * @LastEditTime: 2019-10-30 11:42:23
 */
import { forEachValue } from '../util'

// Base data struct for store's module, package with some attribute and method
export default class Module {
  constructor (rawModule, runtime) {
    this.runtime = runtime
    // Store some children item
    this._children = Object.create(null) // object.create(null)创建一个原型为null的对象，初始化子模块存储器
    // Store the origin module object which passed by programmer
    this._rawModule = rawModule // 原始模块
    const rawState = rawModule.state // 存储模块的state

    // Store the origin module's state
    this.state = (typeof rawState === 'function' ? rawState() : rawState) || {} // state可以是对象，也可以是函数，当没有state配置时，默认为空对象
  }

  // 获取 namespaced 选项，表示当前模块是否启用命名空间
  get namespaced () {
    return !!this._rawModule.namespaced
  }

  // 存储子模块
  addChild (key, module) {
    this._children[key] = module
  }

  // 删除子模块
  removeChild (key) {
    delete this._children[key]
  }

  // 获取子模块
  getChild (key) {
    return this._children[key]
  }

  // 更新模块，给namespaced、actions、mutations、getters赋值
  update (rawModule) {
    this._rawModule.namespaced = rawModule.namespaced
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters
    }
  }

  // 遍历子模块
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }

  // 遍历模块的getters
  forEachGetter (fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn)
    }
  }

  // 遍历模块的actions
  forEachAction (fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn)
    }
  }

  // 遍历模块的mutations
  forEachMutation (fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn)
    }
  }
}
