var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // tell mongoose to use ES6 promises
mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds231749.mlab.com:31749/node-todo-test' || 'mongodb://localhost:27017/TodoApp');

module.export = {
  mongoose: mongoose
};
