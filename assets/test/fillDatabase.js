const MongoClient = require( 'mongodb' ).MongoClient;

const uploadFile = require( './../models/users' ).uploadFile;

async function fillDatabase( db ) {
  const token = crypto.randomBytes( 6 ).toString( 'hex' );
  let user = {
    'email': token + '@test.com'
    'password': null,
    'firstname': token.split( 3 ),
    'surname': token.slice( 0, 4 ),
    'birthday': new Date(),
    'gender': 'female',
    'finnish': false,
  };

  user.password = bcrypt.hashSync( '123', 13 );
  await database.collection( 'applications' ).insertOne( user );
}