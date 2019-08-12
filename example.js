module.exports = {
  margin: 32,
  padding: 12,
  fontSize: 8,
  lineHeight: 9,
  companyName: 'Názov Firmy, s.r.o.',
  companyInfo: 'www.example.com',
  invoiceName: 'Faktúra 2019/0001',
  invoiceInfo: 'daňový doklad',
  metadata: `
    [b]Variabilný symbol | 20160021
    Konštantný symbol | 0308
    Číslo objednávky | 9001099
  `,
  supplier: `
    [b]Názov Firmy, s.r.o.
    [b]Drevená 1/A
    [b]010 01 Žilina
    [b]Slovenská republika

    IČO: XX XXX XXX
    IČ DPH: SK202XXXXXXX

    Spoločnosť je zapísaná v Obchodnom registri OS Mesto, oddiel: s.r.o., vložka č. #####/P

    [b]IBAN | SK33 9900 0000 9987 4263 7541

    Dátum vyhotovenia | 31 jan 2019
    Dátum dodania | 31 jan 2019
    [b]Dátum splatnosti | 15 feb 2019
  `,
  customer: `
    [b]Zákazník, a.s.
    [b]Názov Ulice 3009/45
    [b]821 09 Bratislava

    IČO: YY YYY YYY
    IČ DPH: SK202YYYYYYY

    email@example.com
  `,
  tableSpans: [ 6, 2, 2, false, 2, 1, 2, 3 ],
  articles: [{
    name: 'Hello World!',
    count: 160,
    unitPrice: 75,
    rateVAT: 20,
  }, {
    name: 'Pellentesque nec lorem arcu. Phasellus in nunc sollicitudin, vestibulum lectus vel, varius urna. Integer non lacinia lorem. Integer semper imperdiet massa a accumsan. Vestibulum elementum ullamcorper leo vel aliquam. Maecenas non tristique mi. Sed dignissim auctor enim, ut consequat nulla faucibus in. Fusce commodo velit sit amet mi facilisis blandit.',
    count: 1000,
    unitPrice: 2000,
    rateVAT: 20,
  }],
}
