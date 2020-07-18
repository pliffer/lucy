const path = require('path')
const fs = require('fs-extra')
const express = require('express')
const http = require('http')

global.env = require('dotenv').parse(fs.readFileSync(path.join(__dirname, '.env'), 'utf-8'))

const protocol = global.env.PROTOCOL || 'http'
const host     = global.env.HOST     || 'localhost'
const port     = global.env.PORT     || 8989

global.opts = {}

global.opts.port = port

require(`${__dirname}/cl.js`).init(process)


global.helpers = {}

global.dir = {}

global.dir.root = __dirname

global.dir.app = path.join(global.dir.root, 'app')
global.dir.sql = path.join(global.dir.root, '.sql')
global.dir.log = path.join(global.dir.root, '.log')

global.dir.controllers = path.join(global.dir.app, 'controllers')
global.dir.helpers = path.join(global.dir.app, 'helpers')
global.dir.storage = path.join(global.dir.app, 'storage')
global.dir.models = path.join(global.dir.app, 'models')

global.config = require(`${global.dir.root}/config.js`)

if (global.config.views) {
  global.dir.views = path.join(global.dir.app, global.config.views)
}

if (global.config.socket) {
  global.socket = require(path.join(global.dir.root, 'socket.js'));
}

if (global.config.assets) {
  global.dir.assets = path.join(global.dir.app, global.config.assets)

  global.dir.cssPage = path.join(global.dir.assets, 'css', 'page')
  global.dir.jsPage = path.join(global.dir.assets, 'js', 'page')

  global.dir.cssVendor = path.join(global.dir.assets, 'vendor', 'css')
  global.dir.jsVendor = path.join(global.dir.assets, 'vendor', 'js')
}

Object.values(global.dir).forEach(dir => {
  fs.ensureDirSync(dir)
})

if(global.config.database){
  
  global.db = require(`${__dirname}/db.js`)
  
}

global.log = require(`${__dirname}/log.js`)

const app = express()

global.app = app;

app.disable('x-powered-by')

if (global.config.compression) app.use(require('compression')())

if (global.config.fileupload) app.use(require('express-fileupload')())

if (global.config.morgan) app.use(require('morgan')('dev'))

if (global.config.socket) var socket = require('socket.io')

if (global.config.session && global.config.database) {
  var session = require('express-session')
  var mysqlStore = require('express-mysql-session')(session)

  if (global.config.socket) {
    var ioSession = require('express-socket.io-session')
  }
}

if (global.config.cors) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, action, x-access-token')

    next()
  })
}

if (global.config.body_parser) {
  var bodyParser = require('body-parser')

  app.use(bodyParser.urlencoded({
    extended: false,
    limit: '5mb'
  }))

  app.use(bodyParser.json({
    limit: '5mb'
  }))
}

var server = http.createServer(app)

global.server = server

if (global.config.socket) global.io = socket.listen(server)

if (global.dir.assets) app.use(express.static(global.dir.assets))

if (global.config.template_engine) {
  app.set('cache view', true)

  app.set('views', global.dir.views)
  app.set('view engine', global.config.template_engine)
}

if (global.config.session && global.config.database) {
  var session_store = new mysqlStore({}, global.db)

  var express_session = session({

    secret: global.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: session_store

  })

  app.use(express_session)

  if (global.config.socket) {
    global.io.use(ioSession(express_session, {
      autoSave: true
    }))
  }
}

fs.readdirSync(global.dir.controllers).forEach(controllerName => {
  var controller = path.join(global.dir.controllers, controllerName)

  app.use(require(controller)(new express.Router()))
})

fs.readdirSync(global.dir.helpers).forEach(file => {
  global.helpers[file.replace('.js', '')] = require(path.join(global.dir.helpers, file))
})

if (global.config.ignoreCordovaJs) app.get('cordova.js', (req, res) => res.send(''))

if (global.config.not_found) {
  app.get('*', (req, res) => {
    res.send('404')
  })
}

server.listen(port, () => {

  console.log(`${global.env.APP_NAME} ligado em ${protocol}://${host}:${port} (${new Date()})`)

  if (global.config.socket) {
    global.socket.setup(io)
  }
})

process.on('unhandledRejection', global.log.unhandledRejection)
process.on('uncaughtException', global.log.uncaughtException)
process.on('rejectionHandled', global.log.rejectionHandled)