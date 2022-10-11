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

var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
const { json } = require('express/lib/response');

function getDb(db_name){
    let db = nano.db.use(db_name);
    return db;
}

const app = express();
app.set("port", process.argv[2] || 3000);

app.use(bodyParser.json());
 
app.use('/*',(req,res,next)=>{
  console.log({
    body: req.body,
    query: req.query
  });
  next();
});

app.get(['/','/data'],async(req, res, next)=>{
    
    console.log('req start');
    
    const db = getDb(db_name);
    
    console.log('req 2');

    const content = await getData(db);

    console.log('req');

    res.json(content.docs);
});

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  scalar JSON

  type Doc {
      _id: String,
      _rev: String,
      productId: String,
      productName: String,
      dosageForm: String,
      packageDescription: String,
      packageSize: String,
      packageSizeUnitOfMeasure: String,
      metricStrength: String,
      metricStrengthUnitOfMeasure: String,
      genericProductIdentifier: String,
      gpiGenericName: String,
      manufacturersName: String
  }

  type Query {
    hello: String,
    count: Int,
    all: [Doc],    
  }

`);

// The root provides a resolver function for each API endpoint
var str_to_send = 'Hello world!!!';
var root = {
  JSON: GraphQLJSON, 

  hello: async(...a) => {    
    console.log('hello graphql')
    return "hello, there";
  },

  count:async() => {
    console.log('count graphql')
    return 200
  },

  all: async()=>{
    console.log('all graphql')
    return (await getData(getDb(db_name))).docs;
  }
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

app.get(['/search'], async (req, res, next) => {

    const searchQuery = req.query.search

    const db = getDb(db_name);
    const content = await db.find({
        "selector": {
           "productName": {
              "$regex": `.*(?i)${searchQuery}.*` // (?i) ==  case-insensitive
           }
        }
    })
    res.json(content.docs);
});

app.listen(app.get('port'),()=>{
	console.log("listening on port "+app.get('port'));
});

async function getData(db){

  // returns the first 25, unless noted to be different 
  return await db.find({
    "selector": {
       "_id": {
          "$gt": null
       }
    }
  });

}

// TODO remove
function timeoutPromise(ms){
  return new Promise((resolve, reject)=>{
    setTimeout(resolve,ms);
  }); 
}

