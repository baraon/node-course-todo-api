// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err) {
    return console.log('Unable to connect to mongo database server');
  }
  console.log('Connected to MongoDB server');

  // delete many
  db.collection('Todos').deleteMany({text: 'Something to do'}).then((result) => {
    console.log(result);
  });


  // delete one
  db.collection('Todos').deleteOne({text: 'Something to do'}).then((result) => {
    console.log(result);
  });

  // find one and delete
  db.collection('Todos').findOneAndDelete({text: 'Something to do'}).then((result) => {
    console.log(result);
  });

  //db.close();
});
