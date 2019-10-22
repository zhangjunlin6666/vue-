/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-10-16 16:03:08
 */
import { warn } from '../util/warn'
import { extend } from '../util/misc'

export default {
  name: 'RouterView',
  functional: true,
  // props属性在vue2.3.0版本以上可省略，可选
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  /**
   * 第一个参数为createElement
   * 第二个参数为上下文
   *       props：提供所有 prop 的对象
   *       children: VNode 子节点的数组
   *       slots: 一个函数，返回了包含所有插槽的对象
   *       scopedSlots: (2.6.0+) 一个暴露传入的作用域插槽的对象。也以函数形式暴露普通插槽。
   *       data：传递给组件的整个数据对象，作为 createElement 的第二个参数传入组件
   *       parent：对父组件的引用
   *       listeners: (2.3.0+) 一个包含了所有父组件为当前组件注册的事件监听器的对象。这是 data.on 的一个别名。
  *        injections: (2.3.0+) 如果使用了 inject 选项，则该对象包含了应当被注入的属性。
   */
  render (_, { props, children, parent, data }) {
    // used by devtools to display a router-view badge
    data.routerView = true // 页面中使用router-view组件，就会给该页面中的router-view加一个routerView属性，

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    const h = parent.$createElement
    const name = props.name
    const route = parent.$route // 父级路由对象
    const cache = parent._routerViewCache || (parent._routerViewCache = {}) // 缓存，如果设置了keep-alive会直接读取缓存中的组件

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    let depth = 0
    let inactive = false
    while (parent && parent._routerRoot !== parent) { // 是否存在父级以及父级是否是根组件
      const vnodeData = parent.$vnode && parent.$vnode.data
      if (vnodeData) {
        if (vnodeData.routerView) { // 是否使用router-view组件
          depth++ // 嵌套层次加1
        }
        if (vnodeData.keepAlive && parent._inactive) { // 是否缓存
          inactive = true
        }
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth // router-view的嵌套深度

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    const matched = route.matched[depth]
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null
      return h()
    }

    const component = cache[name] = matched.components[name] // 拿到对应的组件

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = (vm, val) => {
      // val could be undefined for unregistration
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    ;(data.hook || (data.hook = {})).prepatch = (_, vnode) => {
      matched.instances[name] = vnode.componentInstance
    }

    // register instance in init hook
    // in case kept-alive component be actived when routes changed
    data.hook.init = (vnode) => {
      if (vnode.data.keepAlive &&
        vnode.componentInstance &&
        vnode.componentInstance !== matched.instances[name]
      ) {
        matched.instances[name] = vnode.componentInstance
      }
    }

    // resolve props
    let propsToPass = data.props = resolveProps(route, matched.props && matched.props[name])
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass)
      // pass non-declared props as attrs
      const attrs = data.attrs = data.attrs || {}
      for (const key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key]
          delete propsToPass[key]
        }
      }
    }

    return h(component, data, children)
  }
}

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false,
          `props in "${route.path}" is a ${typeof config}, ` +
          `expecting an object, function or boolean.`
        )
      }
  }
}
