 module.exports = {
   //   chainWebpack: config => {
   //     // 发布模式
   //     config.when(process.env.NODE_ENV === 'production', config => {
   //       config
   //         .entry('app')
   //         .clear()
   //         .add('./src/main-prod.js')

   //       config.set('externals', {
   //         vue: 'Vue',
   //         'vue-router': 'VueRouter',
   //         axios: 'axios',
   //         lodash: '_',
   //         echarts: 'echarts',
   //         nprogress: 'NProgress',
   //         'vue-quill-editor': 'VueQuillEditor'
   //       })

   //       config.plugin('html').tap(args => {
   //         args[0].isProd = true
   //         return args
   //       })
   //     })

   //     // 开发模式
   //     config.when(process.env.NODE_ENV === 'development', config => {
   //       config
   //         .entry('app')
   //         .clear()
   //         .add('./src/main-dev.js')

   //       config.plugin('html').tap(args => {
   //         args[0].isProd = false
   //         return args
   //       })
   //     })
   //   }
   // 公共路径(必须有的)
   publicPath: "./",
   // 输出文件目录
   outputDir: "dist",
   // 静态资源存放的文件夹(相对于ouputDir)
   assetsDir: "assets",
   // eslint-loader 是否在保存的时候检查(果断不用，这玩意儿我都没装)
   lintOnSave: false,
   // 我用的only，打包后小些
   // compiler: false,//有
   productionSourceMap: true, // 不需要生产环境的设置false可以减小dist文件大小，加速构建
 }