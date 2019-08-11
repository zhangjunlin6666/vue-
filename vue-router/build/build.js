/*
 * @Author: jackson
 * @Date: 2019-07-10 10:30:54
 * @LastEditors: jackson
 * @LastEditTime: 2019-08-11 01:27:28
 * @Desc：主要做的事情
    1、检查有无dist目录，创建dist目录
    2、递归加载配置选项，调用buildEntry方法打包
    3、打包压缩完成后利用fs模块异步的将打包后的代码写入dist目录对应的文件中
    4、检查是否是min后缀，是否启用zip压缩
 */
const fs = require('fs') // 文件系统模块
const path = require('path') // path模块
const zlib = require('zlib') // node内置模块，用于压缩
const terser = require('terser') // 
const rollup = require('rollup') // rollup代码打包工具
const configs = require('./configs') // 打包配置文件

if (!fs.existsSync('dist')) { // 检查是否存在
  fs.mkdirSync('dist') // 不存在就同步创建dist目录
}

build(configs) // 执行打包，packjosn中的npm run build =====》》》》 node ./build/build.js，实际执行的是build方法

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    // buildEntry方法执行真正的rollup打包，返回一个promise
    /*
      builds[built] = {
        input:{....},
        output:{....}
      }
    */
    buildEntry(builds[built]).then(() => {
      built++
      // 如果打包的次数比配置数组长度小，那就递归调用next方法
      if (built < total) {
        next() 
      }
    }).catch(logError)
  }

  next()
}

function buildEntry ({ input, output }) {
  const { file, banner } = output
  const isProd = /min\.js$/.test(file)
  return rollup.rollup(input) // 添加入口
    .then(bundle => bundle.generate(output))
    .then(({ code }) => {
      // 如果打包文件的后缀带有.min那么就使用terser模块压缩代码
      if (isProd) {
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          toplevel: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    // 向dist目录中写入打包完成后的代码
    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        // 启动zip压缩
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
