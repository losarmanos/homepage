import 'consolecolors'
import {
  writeFileSync as wf,
  readFileSync as rf,
  copyFileSync as cf,
  readdirSync as rd,
  rmSync as rm,
  mkdirSync as mk
} from 'fs'
import pug from 'pug'
import stylus from 'stylus'
import yaml from 'js-yaml'
import url from 'url'
import { resolve } from 'path'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const publicDir = resolve(__dirname, '../public/')
const partials = resolve(__dirname, 'partials/')
const siteParams = yaml.load(rf(resolve(__dirname, '../site.yml')))

const markups = ['index']
const styles = ['styles']

rm(publicDir, { recursive: true, force: true })
mk(resolve(publicDir))
mk(resolve(publicDir, 'images'))

console.log('- Migrating images'.magenta)
const images = rd(resolve(__dirname, 'images'))
images.forEach(image => {
  cf(resolve(__dirname, 'images', image), resolve(publicDir, 'images', image))
})

console.log('- Building Markup files'.magenta)
markups.forEach(item => {
  const template = pug.renderFile(resolve(__dirname, `${item}.pug`), {
    pretty: true,
    ...siteParams
  })
  wf(resolve(publicDir, `${item}.html`), template)
})

console.log('- Building Style files'.magenta)
styles.forEach(async item => {
  const source = resolve(__dirname, `${item}.styl`)
  const css = await new Promise((resolve, reject) => {
    const string = rf(source, 'utf8')
    stylus(string)
      .set('paths', [partials])
      .render((err, rendered) => {
        if (err) return reject(err)
        resolve(rendered)
      })
  })
  wf(resolve(publicDir, `${item}.css`), css)
})
