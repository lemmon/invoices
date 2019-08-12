const PDFDocument = require('pdfkit')
const url = require('url')

const props = require('./example')

props.articles.map(curr => {
  if (!curr.unitPriceVAT && curr.unitPrice) curr.unitPriceVAT = curr.unitPrice * (100 + curr.rateVAT || 0) / 100
  if (!curr.priceTotal && curr.unitPrice) curr.priceTotal = curr.unitPrice * curr.count || 1
  //if (!curr.priceTotal) curr.priceTotal = curr.unitPrice * curr.count || 1
  if (!curr.totalVAT && curr.priceTotal) curr.totalVAT = curr.priceTotal * (curr.rateVAT || 0) / 100
  if (!curr.priceTotalVAT && curr.priceTotal) curr.priceTotalVAT = curr.priceTotal + (curr.totalVAT || 0)
  return curr
})

module.exports = (req, res) => {
  const {
    query,
  } = url.parse(req.url, true)

  const doc = new PDFDocument({
    size: 'a4',
    margin: props.margin,
  })

  const contentWidth = doc.page.width - 2 * props.margin
  const cols2 = {
    width: (contentWidth - 2 * props.padding) / 2,
  }

  doc.lineWidth(.2)
  doc.registerFont('regular', 'fonts/SourceSansPro-Regular.ttf')
  doc.registerFont('bold', 'fonts/SourceSansPro-Bold.ttf')
  doc.registerFont('black', 'fonts/SourceSansPro-Black.ttf')

  const y0 = doc.y

  writeCols(doc, [
    () => {
      doc.fontSize(12).font('black').text(props.companyName, props.margin, y0)
      doc.font('regular').fontSize(8).text(props.companyInfo, props.margin, doc.y + 2)
    },
    () => {
      doc.fontSize(12).font('black').text(props.invoiceName, props.margin, y0, {
        width: doc.page.width - 2 * props.margin,
        align: 'right',
      })
      doc.font('regular').fontSize(8).text(props.invoiceInfo, props.margin, doc.y + 2, {
        width: doc.page.width - 2 * props.margin,
        align: 'right',
      })
    },
  ])

  doc.y += props.padding
  doc.moveTo(props.margin, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()

  doc.font('regular')
  doc.fontSize(props.fontSize)
  doc.lineGap(props.lineHeight - props.fontSize)

  const y = [ doc.y ]
  writeCols(doc, [
    () => {
      doc.x = props.margin
      doc.y += props.padding
      writeLine(doc, 'Dodávateľ', cols2)
      writeText(doc, props.supplier, cols2)
    },
    () => {
      doc.x = doc.page.width / 2 + props.padding
      doc.y += props.padding
      writeText(doc, props.metadata, cols2)
      doc.y += props.padding
      doc.moveTo(doc.page.width / 2, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()
      doc.y += props.padding
      writeLine(doc, 'Odberateľ', cols2)
      writeText(doc, props.customer, cols2)
    },
  ])

  doc.y += props.padding
  doc.moveTo(doc.page.width / 2, y[0]).lineTo(doc.page.width / 2, doc.y).stroke()
  doc.moveTo(props.margin, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()

  doc.x = props.margin
  doc.y += props.padding
  doc.font('bold')
  writeTable(doc, props, [
    'Názov',
    'Mn.',
    'J. cena',
    'J. cena s DPH',
    'Celkom',
    '%DPH',
    'DPH',
    'Celkom s DPH',
  ], props.tableSpans)

  doc.y += props.padding
  doc.moveTo(props.margin, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()

  doc.font('regular')

  props.articles.forEach((article, i) => {
    doc.y += props.padding
    writeTable(doc, props, [
      article.name,
      formatNumber(article.count, 0),
      formatNumber(article.unitPrice, 2),
      formatNumber(article.unitPriceVAT, 2),
      formatNumber(article.priceTotal, 2),
      typeof article.rateVAT === 'number' ? `${article.rateVAT}%` : null,
      formatNumber(article.totalVAT, 2),
      formatNumber(article.priceTotalVAT, 2),
    ], props.tableSpans)
  })

  doc.y += props.padding
  doc.moveTo(props.margin, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()

  doc.x = props.margin
  doc.y += props.padding
  doc.font('bold')
  writeTable(doc, props, [
    'Celkom',
    null,
    null,
    null,
    formatNumber(sum(props.articles.map(curr => curr.priceTotal)), 2),
    null,
    formatNumber(sum(props.articles.map(curr => curr.totalVAT)), 2),
    formatNumber(sum(props.articles.map(curr => curr.priceTotalVAT)), 2),
  ], props.tableSpans)
  writeTable(doc, props, [
    null,
    null,
    null,
    null,
    'EUR',
    null,
    'EUR',
    'EUR',
  ], props.tableSpans)

  doc.y += props.padding
  doc.moveTo(props.margin, doc.y).lineTo(doc.page.width - props.margin, doc.y).stroke()

  doc.pipe(res)
  doc.end()
}

function writeCols(doc, cols) {
  const y = [ doc.y ]
  cols.forEach(col => {
    doc.y = y[0]
    col(doc)
    y.push(doc.y)
  })
  doc.y = Math.max(...y)
}

function writeTable(doc, props, cells, spans = []) {
  const x = [ doc.x ]
  const y = [ doc.y ]
  const n = cells.length
  if (spans.length < n) {
    spans.push(...new Array(n - spans.length).fill(1))
  }
  const w = doc.page.width - 2 * props.margin - (spans.filter(span => span).length - 1) * props.padding
  const spansTotal = sum(spans)
  cells.forEach((cell, i) => {
    if (spans[i]) {
      const width = w / spansTotal * spans[i]
      const text = cell && trimText(cell)
      if (text) {
        doc.text(text
          , sum(x)
          , y[0]
          , { width, align: i ? 'right' : 'left' }
        )
      }
      x.push(width + props.padding)
      y.push(doc.y)
    }
  })
  doc.x = x[0]
  doc.y = Math.max(...y)
}

function sum(arr) {
  return arr.reduce((a, b) => (a + b), 0)
}

function writeText(doc, str, props) {
  trimText(str).split(/\n/).forEach(line => {
    writeLine(doc, line, props)
  })
}

function writeLine(doc, input, props) {
  const m = input.match(/(\[(\w+)\])?(.*)/)
  const style = m[2]
  const line = m[3]
  doc.font(style && style.includes('b') ? 'bold' : 'regular')
  if (line.includes('|')) {
    const cols = line.split(/\s*\|\s*/, 2)
    const y = [ doc.y ]
    doc.text(cols[0], props)
    y.push(doc.y)
    doc.text(cols[1], doc.x, y[0], Object.assign({}, props, {
      align: 'right',
    }))
    y.push(doc.y)
    doc.y = Math.max(...y)
  } else if (line) {
    doc.text(line, props)
  } else {
    doc.y += doc._fontSize + doc._lineGap
  }
}

function formatNumber(num, dec = 0, decPoint = ',', thousandsSep = ' ') {
  if (typeof num !== 'number') return null
  const re = '\\d(?=(\\d{3})+' + (dec > 0 ? `\\${decPoint}` : '$') + ')'
  return num.toFixed(Math.max(0, ~~dec)).replace('.', decPoint).replace(new RegExp(re, 'g'), `$&${thousandsSep}`)
}

function trimText(str) {
  return str
    .trim()
    .replace(/^[\t ]+/gm, '')
    .replace(/[\t ]+$/gm, '')
}
