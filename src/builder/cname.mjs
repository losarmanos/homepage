import {
  writeFileSync as wf,
  readFileSync as rf
} from 'fs'
import { resolve } from 'path'
import yaml from 'js-yaml'

export const execute = (publicDir, templateDir) => {
  const definitions = yaml.load(rf(resolve(templateDir, 'site.yml')))
  const { cname } = definitions

  console.log('- Creating CNAME file'.magenta)
  wf(resolve(publicDir, 'CNAME'), cname)
}
