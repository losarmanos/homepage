import 'consolecolors'
import {
  rmSync as rm,
  mkdirSync as mk
} from 'fs'
import url from 'url'
import { resolve } from 'path'
import { execute as imageExec } from './images.mjs'
import { execute as markupExec } from './markup.mjs'
import { execute as stylExec } from './styles.mjs'
import { execute as dynamicExec } from './dynamic.mjs'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '../')
const publicDir = resolve(root, '../public/')
const templateDir = resolve(root, 'template/')

rm(publicDir, { recursive: true, force: true })
mk(resolve(publicDir))

imageExec(publicDir, templateDir)
markupExec(root, publicDir, templateDir)
stylExec(root, publicDir, templateDir)
dynamicExec(root, publicDir, templateDir)
