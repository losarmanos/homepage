import {
  writeFileSync as wf,
  readFileSync as rf
} from 'fs'
import { resolve } from 'path'
import stylus from 'stylus'
import yaml from 'js-yaml'

export const execute = (root, publicDir, templateDir) => {
  console.log('- Building Style files'.magenta)
  const defaultParams = yaml.load(rf(resolve(templateDir, 'site.yml')))
  const newParams = yaml.load(rf(resolve(root, '../site.yml')))
  const definitions = Object.assign(defaultParams, newParams)
  const { styles } = definitions.params
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
}
