const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const xmlbuilder = require('xmlbuilder');
const fs = require('fs');

const options = {
    attributeNamePrefix: '',
    attrNodeName: '$',
    textNodeName: '_',
    ignoreAttributes: false,
};
const app = express();
const port = 8000;
fs.readFile("data.xml", "utf8", (err, data) => {
    if (err) {
        console.error('Помилка при читанні файлу:', err);
        return;
    }
    const parser = new XMLParser(options);
    const obj = parser.parse(data);
    let maxRate = -Infinity;

    for (const currency of obj.exchange.currency) {
        if (currency.rate) {
            const rate = parseFloat(currency.rate);
            if (!isNaN(rate) && rate > maxRate) {
                maxRate = rate;
            }
        }
    }
    console.log(maxRate);
    const resultXml = xmlbuilder.create('data')
        .ele('max_rate', maxRate.toString())
        .end({ pretty: true });
    fs.writeFile("result.xml", resultXml.toString(), (err) => {
        if (err) {
            console.error('Помилка при записі у файл:', err);
            return;
        }
        console.log("Yeah!");
    });
});
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(__dirname + '/result.xml');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
