require('dotenv').config()

const db_url = process.env.DB_URL;

// console.log(process.env.DB_URL);
// return

const db_a = 'db_a';
const db_b = 'db_b';

const nano = require('nano')(db_url);
const fs = require('fs');

function getDb(db_name){
    let db = nano.db.use(db_name);

    return db;
}

async function populateDb(){

    await nano.db.create( db_a )
    .then((data)=>{
        console.log(data);
    }).catch((err)=>{
        console.log(err);
    });

    await nano.db.create( db_b ).then((data)=>{
        console.log(data);
    }).catch((err)=>{
        console.log(err);
    });

    console.log('after create db')

    const s = fs.readFileSync(`data/medispanProducts.json`);
    const obj = JSON.parse(s);

    // const dosageForm_list = [];
    const packageDescription_list = [];

    obj.forEach((cur)=>{
        const packageDescription = cur.packageDescription;
        if( !packageDescription_list.includes( packageDescription ) ){
            packageDescription_list.push(packageDescription)
        }
    });

    // console.log(dosageForm_list);
    const items_list_1 = packageDescription_list.slice(0, parseInt(packageDescription_list.length/2));
    const items_list_2 = packageDescription_list.slice(parseInt(packageDescription_list.length/2));

    console.log( items_list_1 );
    console.log( items_list_2 );

    const db1 = getDb( db_a );
    const db2 = getDb( db_b );

    console.log(`there are ${obj.length} entries`);

    const max_count = 100;
    let a_count = 0;
    let b_count = 0;

    obj.forEach((cur)=>{
        if( items_list_1.includes( cur.packageDescription ) ){
            if(a_count < max_count){
                db1.insert(cur);
            }
            a_count++
        }else{
            if(b_count < max_count){
                db2.insert(cur);
            }
            b_count++
        }
    });

    console.log({a_count,b_count});
}

populateDb();
