const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const{Todo} = require('./../server/models/todo');

var id = "5ae8e2cb2e5706441bbe1651";

if(!ObjectID.isValid(id)) {
  return console.log('Invalid ID');
}

Todo.find({
  _id: id,
}).then((todos) => {
  if(todos.length === 0) {
    return console.log('IDs not found');
  }
  console.log('Todos', todos);
});

Todo.findOne({
  _id: id,
}).then((todo) => {
  if(!todo) {
    return console.log('ID not found');
  }
  console.log('Todos', todo);
});

Todo.findById(id).then((todo) => {
  if(!todo) {
    return console.log('ID not found');
  }
  console.log('Todos by id', todo);
}).catch((e) => console.log(e));
