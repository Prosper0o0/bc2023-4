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

app.get('/', (req, res) => {
    fs.readFile("data.xml", "utf8", (err, data) => {
        if (err) {
            console.error('Помилка при читанні файлу:', err);
            return;
        }
        const parser = new XMLParser(options);
        const obj = parser.parse(data);
        let maxRate = -Infinity;
        let currencies;

        if (Array.isArray(obj.exchange.currency)) {
            currencies = obj.exchange.currency;
        } else {
            currencies = [obj.exchange.currency];
        }
        for (const currency of currencies) {
            if (currency.rate) {
                const rate = parseFloat(currency.rate);
                if (!isNaN(rate) && rate > maxRate) {
                    maxRate = rate;
                }
            }
        }
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
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(__dirname + '/result.xml');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
