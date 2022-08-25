const db_url = process.env.DB_URL;

// console.log(process.env.DB_URL);
// return

const db_a = 'db_a';
const db_b = 'db_b';

const nano = require('nano')(db_url);
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

function getDb(db_name) {
    let db = nano.db.use(db_name);
    return db;
}

const app = express();
app.set("port", process.argv[2] || 3000);

app.use(bodyParser.json());

app.get('/', async (req, res, next) => {

    const content = {
        "_id": "x",
        "_rev": "x",
        "productId": "x",
        "productName": "x",
        "dosageForm": "x",
        "packageDescription": "x",
        "packageSize": "x",
        "packageSizeUnitOfMeasure": "x",
        "metricStrength": "x",
        "metricStrengthUnitOfMeasure": "x",
        "genericProductIdentifier": "x",
        "gpiGenericName": "x",
        "manufacturersName": "x"
    }

    console.log('req');

    res.json(content);
});

app.listen(app.get('port'), () => {
    console.log("listening on port " + app.get('port'));
});
