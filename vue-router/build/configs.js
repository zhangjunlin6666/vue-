/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-10 23:45:50
 * @Desc：vue-router配置文件
 */
const path = require('path')
const buble = require('rollup-plugin-buble')
const flow = require('rollup-plugin-flow-no-whitespace')
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const replace = require('rollup-plugin-replace')
const version = process.env.VERSION || require('../package.json').version
const banner =
`/*!
  * vue-router v${version}
  * (c) ${new Date().getFullYear()} Evan You
  * @license MIT
  */`

const resolve = _path => path.resolve(__dirname, '../', _path)

// router-view各个目标打包的配置数组
module.exports = [
  // browser dev
  {
    file: resolve('dist/vue-router.js'), // umd模式，开发环境未压缩
    format: 'umd',
    env: 'development'
  },
  {
    file: resolve('dist/vue-router.min.js'), // umd模式。产品环境压缩
    format: 'umd',
    env: 'production'
  },
  {
    file: resolve('dist/vue-router.common.js'), // commonjs标准，即module.exports\require
    format: 'cjs'
  },
  {
    file: resolve('dist/vue-router.esm.js'), // es6的模块导入方式，即import和export
    format: 'es'
  },
  {
    file: resolve('dist/vue-router.esm.browser.js'), // 浏览器中的es6开发模式
    format: 'es',
    env: 'development',
    transpile: false
  },
  {
    file: resolve('dist/vue-router.esm.browser.min.js'),// 浏览器中的es6产品模式
    format: 'es',
    env: 'production',
    transpile: false
  }
].map(genConfig) // map循环生成配置数组

function genConfig (opts) {
  const config = {
    input: { // 入口
      input: resolve('src/index.js'), // vue-router源码入口文件
      plugins: [ // 插件
        flow(),
        node(),
        cjs(),
        replace({
          __VERSION__: version
        })
      ]
    },
    output: { // 出口
      file: opts.file, // 文件的出口
      format: opts.format, // 目标
      banner, // 打包时的提示
      name: 'VueRouter' // 名称
    }
  }

  if (opts.env) {
    // 如果存在env变量，即在插件数组前增加一个插件
    config.input.plugins.unshift(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  if (opts.transpile !== false) {
    // 如果transpile不为false则调用插件buble
    config.input.plugins.push(buble())
  }

  return config // 返回配置
}
