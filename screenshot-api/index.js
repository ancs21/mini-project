const puppeteer = require('puppeteer')
const express = require('express')
const app = express()

app.use('/images', express.static('images'))

app.get('/', async (req, res, next) => {
  const { url } = req.query
  const hostname = new URL(url).hostname

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url)
  await page.screenshot({ path: `images/${hostname}.png` })

  await browser.close()
  const urlImg = `http://${req.headers.host}/images/${hostname}.png`
  res.send(`<img width="800" src=${urlImg} >`)
})

app.listen(8080, () => console.log('app runing...'))
