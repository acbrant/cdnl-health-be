const db_url = process.env.DB_URL;
const db_name = process.env.DB_NAME; 

// console.log(process.env.DB_URL);
// return

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');

const mysql = require('mysql2/promise');
const {HOST, USER, PASSWORD, DATABASE, TABLE} = process.env;


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
    return (await getData()).docs;
  }
};

async function main(){

  let singleStoreConnection;
  try {
    singleStoreConnection = await mysql.createConnection({
      host: HOST,
      user: USER,
      password: PASSWORD,
      database: DATABASE
    });

    console.log("You have successfully connected to SingleStore.");
  
  } catch (err) {
    // Good programmers always handle their errors :)
    console.error('Error connecting to single store');
    console.error('ERROR', err);
    process.exit(1);
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
      
      const content = await readOne({conn:singleStoreConnection});

      res.json(content);
  });

  app.use('/graphql', graphqlHTTP({
      schema: schema,
      rootValue: root,
      graphiql: true,
  }));

  // TODO move this to SQL
  app.get(['/search'], async (req, res, next) => {
    req.sendStatus(410);
  });

  app.listen(app.get('port'),()=>{
    console.log("listening on port "+app.get('port'));
  });

  async function readOne({ conn, id }) {
    const [rows, fields] = await conn.execute(
      `select * from ${TABLE};`,
    );
    return rows[0];
  };

  process.on('exit',async ()=>{
    console.log('closing db connection');
    (async()=>{
      await singleStoreConnection.end();
    })();
    console.log('db connection closed');
  });
  
}
main();

async function getData(db){
  // returns the first 25, unless noted to be different 
  return await readOne({conn:singleStoreConnection});
}
