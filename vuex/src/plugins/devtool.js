/*
 * @Author: jackson
 * @Date: 2019-10-16 17:00:14
 * @LastEditors: jackson
 * @LastEditTime: 2019-10-23 16:16:09
 */
const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
const devtoolHook = target.__VUE_DEVTOOLS_GLOBAL_HOOK__

export default function devtoolPlugin(store) {
  if (!devtoolHook) return

  store._devtoolHook = devtoolHook

  devtoolHook.emit('vuex:init', store)

  devtoolHook.on('vuex:travel-to-state', targetState => {
    store.replaceState(targetState)
  })

  store.subscribe((mutation, state) => {
    devtoolHook.emit('vuex:mutation', mutation, state)
  })
}
