const db_url = process.env.DB_URL;
const db_name = process.env.DB_NAME; 

// console.log(process.env.DB_URL);
// return

const db_a = 'db_a';
const db_b = 'db_b';

const nano = require('nano')(db_url);
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

function getDb(db_name){
    let db = nano.db.use(db_name);
    return db;
}

const app = express();
app.set("port", process.argv[2] || 3000);

app.use(bodyParser.json());

app.get('/',async(req, res, next)=>{

    const db = getDb(db_name);

    // returns the first 25, unless noted to be different 
    content = await db.find({
        "selector": {
           "_id": {
              "$gt": null
           }
        }
    });

    console.log('req');

    res.json(content.docs);
});

app.listen(app.get('port'),()=>{
	console.log("listening on port "+app.get('port'));
});
