import 'consolecolors'
import {
  rmSync as rm,
  mkdirSync as mk
} from 'fs'
import url from 'url'
import { resolve, extname } from 'path'
import chokidar from 'chokidar'
import liveServer from 'live-server'

import { execute as imageExec } from './images.mjs'
import { execute as markupExec } from './markup.mjs'
import { execute as stylExec } from './styles.mjs'
import { execute as dynamicExec } from './dynamic.mjs'
import { execute as cnameExec } from './cname.mjs'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '../')
const publicDir = resolve(root, '../public/')
const templateDir = resolve(root, 'template/')
const contentDir = resolve(root, 'content/')
const [, , once] = process.argv
const isBuilding = once === 'once'

const buildAll = async _ => {
  rm(publicDir, { recursive: true, force: true })
  mk(resolve(publicDir))
  imageExec(publicDir, templateDir)
  markupExec(publicDir, templateDir)
  await stylExec(publicDir, templateDir)
  dynamicExec(root, publicDir, templateDir)
  cnameExec(publicDir, templateDir)
}

await buildAll()
if (isBuilding) process.exit(0)

const watcher = chokidar.watch(
  [
    contentDir,
    templateDir
  ], {
    ignored: /(^|[\/\\])\../, // eslint-disable-line
    persistent: true
  }
)

watcher
  .on('ready', () => console.log('Dev watcher started'))
  .on('raw', (_event, path) => {
    const fileType = extname(path)
    switch (fileType) {
      case '.pug':
        markupExec(publicDir, templateDir)
        break
      case '.styl':
        console.log('- Change in styles detected'.green)
        stylExec(publicDir, templateDir)
        break
      case '.yml':
        console.log('- Change in site configuration'.green)
        buildAll()
        break
      case '.md':
        console.log('- Change in Blog files'.green)
        dynamicExec(root, publicDir, templateDir)
        break
      case '':
        console.log(_event, path)
        break
      default:
        console.log('- Change in images'.green)
        imageExec(publicDir, templateDir)
    }
  })
  .on('error', error => console.error(error))

liveServer.start({
  port: 8080,
  host: 'localhost',
  root: publicDir,
  file: 'index.html',
  logLevel: 2,
  open: false
})
