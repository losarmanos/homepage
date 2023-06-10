import {
  writeFileSync as wf,
  readFileSync as rf,
  readdirSync as rd,
  mkdirSync as mk
} from 'fs'
import { resolve, extname, basename } from 'path'
import yaml from 'js-yaml'
import { marked } from 'marked'
import pug from 'pug'

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

export const execute = (root, publicDir, templateDir) => {
  const defaultParams = yaml.load(rf(resolve(templateDir, 'site.yml')))
  const newParams = yaml.load(rf(resolve(root, '../site.yml')))
  const definitions = Object.assign(defaultParams, newParams)
  const siteParams = JSON.parse(JSON.stringify(definitions))
  delete siteParams.params
  delete siteParams.cname

  const pages = getDynamic(resolve(root, 'content'))
  const posts = getDynamic(resolve(root, 'content', 'posts'))
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
}
