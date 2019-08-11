/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-11 23:08:37
 * @Desc：此文件重要的做了一下几件事：
    1、在vue原型上挂载只读的$router、$route
    2、注册两个vue-router的组件
    3、利用vue.mixin()进行一些变量的初始化，例如_routerRoot、_router、_route
 */
import View from './components/view'
import Link from './components/link'

export let _Vue

// 导出install方法，该方法是给vue.use()传递参数对象中的install函数属性，vue.use()内部会调用install方法
// 并将vue当前实例传递给install
export function install (Vue) {
  // 检查插件有无注册，如果已经注册，则返回，只会调用一次
  if (install.installed && _Vue === Vue) return
  install.installed = true // 已经注册的标识符

  _Vue = Vue // 拿到vue当前实例

  const isDef = v => v !== undefined // 检查变量是否是undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode // 获取vm的父级虚拟dom
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 利用vue的minix混合功能
  Vue.mixin({
    // vue实例创建前的钩子
    beforeCreate () {
      // 检查当前是否实例中是否有router选项
      if (isDef(this.$options.router)) {
        this._routerRoot = this // this赋值给this._routerRoot.在浏览器中打印this，可见_routerRoot变量
        this._router = this.$options.router // 将vue-router的实例赋值给this._router
        this._router.init(this) // 执行路由实例的init方法，并将vue的实例this传递进去
        // 监控 router数据变化，这里为更新router-view
        Vue.util.defineReactive(this, '_route', this._router.history.current) // 将this上的_route属性修改成响应式的，初始值为this._router.history.current
      } else {
        // 如果不存在，当前实例的_routerRoot属性要么是自身，要么是父实例的_routerRoot，为每个组件传递根组件，方便访问router信息
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 在vue的原型上定义$router属性，并且是只读的，值是vue-router实例，即new Router();
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 在vue的原型上定义$route属性，并且是只读的，值是this._router.history.current
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册router-view、router-link两个组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
