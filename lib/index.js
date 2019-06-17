const fs = require('fs')
const program = require('commander')
const puppeteer = require('puppeteer')
const { resolve } = require('./utils')
const json2vcf = require('./json2vcf')
const json2xlsx = require('./json2xlsx')

let results = []

const fetchBaseInfos = async (page) => {
  results = results.concat(await page.evaluate(() => {
    const infos = []
    const items = document.querySelectorAll('.j-every')

    Array.prototype.forEach.call(items, (item) => {
      const {
        innerText: name,
        href
      } = item.querySelector('a[target]') || {}

      const {
        innerText: address
      } = item.querySelector('.adds') || {}

      infos.push({ name, href, address })
    });

    return infos
  }))

  try {
    const nextPageHref = await page.$eval('.next a', node => node.href)
    await page.goto(nextPageHref)
    await fetchBaseInfos(page)
  } catch (err) {
    if (err && program.debug) {
      console.error(err)
    }
  }
}

const fetchMoreInfos = async (page, index = 0) => {
  const total = results.length
  const nextIndex = index + 1

  console.log(`正在获取第 ${nextIndex} 条详细信息，共 ${total} 条`)

  await page.goto(results[index].href)

  let phonenumber

  try {
    phonenumber = await page.$eval('.displayphonenumber', (node) => {
      node.getAttribute('gjalog').match(/phone=(.*?)@/)
      return RegExp.$1
    })
  } catch (err) {
    phonenumber = await page.$eval('.phoneNum-style', (node) => {
      return node.innerText
    })
  }

  results[index]['phonenumber'] = phonenumber

  if (nextIndex < total) {
    try {
      await fetchMoreInfos(page, nextIndex)
    } catch (err) {
      await fetchMoreInfos(page, nextIndex + 1)
    }
  }
}

module.exports = async (areacode, keyword, site = 'ganji') => {
  console.log('开始初始化程序')

  const browser = await puppeteer.launch({
    headless: !program.debug
  });

  const page = await browser.newPage();

  page.setViewport({
    width: 1376,
    height: 768
  })

  await page.goto(`http://${areacode}.ganji.com/site/s/_${keyword}/`);

  console.log('开始获取基础信息')

  await fetchBaseInfos(page)

  console.log('基础信息获取完毕')

  await fetchMoreInfos(page)

  console.log('详细信息获取完毕')

  await browser.close()

  if (program.debug) {
    const filePath = resolve(`赶集网-${keyword}-${areacode}.json`)
    fs.writeFileSync(filePath, JSON.stringify(results, null, '  '))
  }

  console.log('开始生成文件')

  json2vcf(results, keyword, areacode)
  json2xlsx(results, keyword, areacode)

  console.log('文件生成完毕')
}
