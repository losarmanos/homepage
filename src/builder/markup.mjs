import {
  writeFileSync as wf,
  readFileSync as rf
} from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'
import pug from 'pug'

export const execute = (root, publicDir, templateDir) => {
  const defaultParams = yaml.load(rf(resolve(templateDir, 'site.yml')))
  const newParams = yaml.load(rf(resolve(root, '../site.yml')))
  const definitions = Object.assign(defaultParams, newParams)
  const { params: { markups }, cname } = definitions
  const siteParams = JSON.parse(JSON.stringify(definitions))
  delete siteParams.params
  delete siteParams.cname
  console.log('- Building Markup files'.magenta)
  markups.forEach(item => {
    const template = pug.renderFile(resolve(templateDir, `${item}.pug`), {
      pretty: true,
      ...siteParams
    })
    wf(resolve(publicDir, `${item}.html`), template)
  })

  console.log('- Creating CNAME file'.magenta)
  wf(resolve(publicDir, 'CNAME'), cname)
}
