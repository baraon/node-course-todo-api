var mongoose = require('mongoose');

mongoose.Promise = global.Promise; // tell mongoose to use ES6 promises
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.export = {
  mongoose: mongoose
};
