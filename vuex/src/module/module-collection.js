/*
 * @Author: jackson
 * @Date: 2019-10-16 17:00:14
 * @LastEditors: jackson
 * @LastEditTime: 2019-10-30 14:06:06
 */
import Module from './module'
import { assert, forEachValue } from '../util'

export default class ModuleCollection {
  constructor (rawRootModule) {
    // register root module (Vuex.Store options)
    this.register([], rawRootModule, false)
  }

  // 获取一个模块，this.root为根模块
  // 数组的reduce方法，当遍历的数组为空，以及reduce传递了第二个参数时，那么遍历返回的就是第二个参数值
  // 所以在调用get方法，path为[]空数组时，get方法返回的就是this.root，即根模块
  get (path) {
    return path.reduce((module, key) => {
      return module.getChild(key)
    }, this.root)
  }

  // 获取命名空间，当模块配置了namespaced属性时，即 a/b/c/d，
  // 数组的reduce方法，当遍历的数组为空，以及reduce传递了第二个参数时，那么遍历返回的就是第二个参数值
  // 所以在调用get方法，path为[]空数组时，get方法返回的就是‘’，即空字符串，
  // 如果传入的path不为空数组时，根据模块是否设置namespaced属性，动态生成命名空间路径
  getNamespace (path) {
    let module = this.root
    return path.reduce((namespace, key) => {
      module = module.getChild(key)
      return namespace + (module.namespaced ? key + '/' : '')
    }, '')
  }


  // 更新模块
  update (rawRootModule) {
    update([], this.root, rawRootModule)
  }

  // 注册模块
  register (path, rawModule, runtime = true) {
    if (process.env.NODE_ENV !== 'production') {
      assertRawModule(path, rawModule) // 注册前需要验证模块中的某些选项的类型
    }

    
    const newModule = new Module(rawModule, runtime) // 每一个模块都是重新实例化的模块对象
    if (path.length === 0) { // 没有子模块时
      this.root = newModule // 存储根模块
    } else {
      const parent = this.get(path.slice(0, -1)) // 当vuex的配置选项中的modules只有一层时，parant的值跟this.root一致
      parent.addChild(path[path.length - 1], newModule) // 将当前模块存储到父模块的_children属性中
    }

    // register nested modules
    if (rawModule.modules) { // 有子模块时
      forEachValue(rawModule.modules, (rawChildModule, key) => { // 获取子模块的key并遍历，传入value值和key
        this.register(path.concat(key), rawChildModule, runtime) // 递归调用register进行子模块的注册
      })
    }
  }

  // 卸载模块
  unregister (path) {
    const parent = this.get(path.slice(0, -1))
    const key = path[path.length - 1]
    if (!parent.getChild(key).runtime) return

    parent.removeChild(key)
  }
}

function update (path, targetModule, newModule) {
  if (process.env.NODE_ENV !== 'production') {
    assertRawModule(path, newModule)
  }

  // update target module
  targetModule.update(newModule)

  // update nested modules
  if (newModule.modules) {
    for (const key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[vuex] trying to add a new module '${key}' on hot reloading, ` +
            'manual reload is needed'
          )
        }
        return
      }
      update(
        path.concat(key),
        targetModule.getChild(key),
        newModule.modules[key]
      )
    }
  }
}

// 是否为函数类型
const functionAssert = {
  assert: value => typeof value === 'function',
  expected: 'function'
}

// 是否为函数类型，或者带有handler属性的对象
const objectAssert = {
  assert: value => typeof value === 'function' ||
    (typeof value === 'object' && typeof value.handler === 'function'),
  expected: 'function or object with "handler" function'
}

// 选项类型
const assertTypes = {
  getters: functionAssert,
  mutations: functionAssert,
  actions: objectAssert
}

// 模块中getters、mutations、actions选项中各type的类型检测
function assertRawModule (path, rawModule) {
  // 遍历assertTypes
  Object.keys(assertTypes).forEach(key => {
    // 判断传入的选项options是否含有getters、mutations、actions字段，没有就返回中断此次循环后续处理
    if (!rawModule[key]) return

    /* 获取对应key（getters、mutations、actions）的相关配置，例如getters的配置，
        assertOptions = assertTypes['getters'] = {
          assert: value => typeof value === 'function',
          expected: 'function'
        }
    */
    const assertOptions = assertTypes[key] 
    
    /* rawModule[key]是传入给Store构造函数中某一个选项配置对象，例如getters：
        rawModule['getters'] = {
          getCount(state){
            return 8888;
          }
        }
    */
    // forEachValue通过Object.keys(rawModule[key])获取对象的key并遍历，
    // 并将对象中的value（也就是某个getters的函数）、key（为getters的类型）传递给回调函数fn
    forEachValue(rawModule[key], (value, type) => {
      // assert是一个错误处理函数，第一个参数为boolean值，第二个参数是错误提示文字
      assert(
        assertOptions.assert(value), // 判断传入的value的类型，返回的是boolean值 
        makeAssertionMessage(path, key, type, value, assertOptions.expected) // 返回的文字提示
      )
    })
  })
}

// 返回消息提示
function makeAssertionMessage (path, key, type, value, expected) {
  let buf = `${key} should be ${expected} but "${key}.${type}"`
  if (path.length > 0) {
    buf += ` in module "${path.join('.')}"`
  }
  buf += ` is ${JSON.stringify(value)}.`
  return buf
}
