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
import { marked } from 'marked'
import yaml from 'js-yaml'
import url from 'url'
import { resolve, extname, basename } from 'path'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const publicDir = resolve(__dirname, '../public/')
const templateDir = resolve(__dirname, 'template/')
const defaultParams = yaml.load(rf(resolve(templateDir, 'site.yml')))
const newParams = yaml.load(rf(resolve(__dirname, '../site.yml')))

const definitions = Object.assign(defaultParams, newParams)
const { params: { markups, styles }, cname } = definitions
const siteParams = JSON.parse(JSON.stringify(definitions))
delete siteParams.params
delete siteParams.cname

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

console.log('- Loading dynamic data'.magenta)
const getDate = input => {
  if (!input?.meta) return {}
  const date = input.meta.date.toString()
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  const day = date.slice(6, 8)
  return {
    ...input.meta,
    date: new Date(year, month - 1, day)
  }
}
const getDynamic = dir => {
  try {
    return rd(dir)
      .filter(item => extname(item) === '.md')
      .map(item => resolve(dir, item))
      .map(file => ({ markdown: rf(file, 'utf8'), file }))
      .map(({ markdown, file }) => {
        const [meta, ...mkd] = markdown.split('\n\n')
        const parsedMeta = getDate(yaml.load(meta))
        return { markdown: mkd.join('\n\n'), file, meta: parsedMeta }
      })
      .map(({ markdown, file, meta }) => ({
        html: marked.parse(markdown, { mangle: false, headerIds: false }),
        path: basename(file, '.md'),
        meta
      }))
  } catch (e) {
    return []
  }
}

const pages = getDynamic(resolve(__dirname, 'content'))
const posts = getDynamic(resolve(__dirname, 'content', 'posts'))
  .sort((a, b) => {
    if (a.meta.date > b.meta.date) return -1
    if (a.meta.date < b.meta.date) return 1
    return 0
  })
if (posts.length > 0) mk(resolve(publicDir, 'posts'))

pages
  .map(({ html, path }) => {
    const list = pug.renderFile(resolve(templateDir, 'partials/blogList.pug'), {
      pretty: true,
      posts
    })
    return {
      html: html.replace('<p>!{blogList}</p>', list),
      path
    }
  })
  .forEach(({ html, path }) => {
    const template = pug.renderFile(resolve(templateDir, 'page.pug'), {
      pretty: true,
      ...Object.assign(siteParams, { pageData: html })
    })
    mk(resolve(publicDir, path))
    wf(resolve(publicDir, `${path}/index.html`), template)
  })

posts
  .map((item, index) => {
    const prev = posts[index - 1] || {}
    const next = posts[index + 1] || {}
    return {
      ...item,
      prev: { ...prev.meta, path: prev.path },
      next: { ...next.meta, path: next.path }
    }
  })
  .forEach(({ html, path, prev, next }) => {
    const template = pug.renderFile(resolve(templateDir, 'post.pug'), {
      pretty: true,
      ...Object.assign(siteParams, { pageData: html }),
      prev,
      next
    })
    mk(resolve(publicDir, 'posts', path))
    wf(resolve(publicDir, `posts/${path}/index.html`), template)
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

console.log('- Creating CNAME file'.magenta)
wf(resolve(publicDir, 'CNAME'), cname)
