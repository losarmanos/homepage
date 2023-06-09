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
const templateDir = resolve(__dirname, 'template/')
const defaultParams = yaml.load(rf(resolve(templateDir, 'site.yml')))
const newParams = yaml.load(rf(resolve(__dirname, '../site.yml')))

const definitions = Object.assign(defaultParams, newParams)
const { markups, styles } = definitions.params
const siteParams = JSON.parse(JSON.stringify(definitions))
delete siteParams.params

rm(publicDir, { recursive: true, force: true })
mk(resolve(publicDir))
mk(resolve(publicDir, 'images'))

console.log('- Migrating images'.magenta)
const images = rd(resolve(templateDir, 'images'))
images.forEach(image => {
  cf(resolve(templateDir, 'images', image), resolve(publicDir, 'images', image))
})
const favicon = rd(resolve(templateDir, 'favicon'))
favicon.forEach(item => {
  cf(resolve(templateDir, 'favicon', item), resolve(publicDir, item))
})

console.log('- Building Markup files'.magenta)
markups.forEach(item => {
  const template = pug.renderFile(resolve(templateDir, `${item}.pug`), {
    pretty: true,
    ...siteParams
  })
  wf(resolve(publicDir, `${item}.html`), template)
})

console.log('- Building Style files'.magenta)
const partials = resolve(templateDir, 'partials/')
styles.forEach(async item => {
  const source = resolve(templateDir, `${item}.styl`)
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
