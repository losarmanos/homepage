import {
  writeFileSync as wf,
  readFileSync as rf
} from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'
import pug from 'pug'

export const execute = (publicDir, templateDir) => {
  const definitions = yaml.load(rf(resolve(templateDir, 'site.yml')))
  const { markups } = definitions.params
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
}
