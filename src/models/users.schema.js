const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  UserName: {
    type: String,
    required: 'Required',
  },
  FirstName: {
    type: String,
    required: 'Required',
  },
  LastName: {
    type: String,
    required: 'Required',
  },
  Age: {
    type: Number,
    required: 'Required',
  },
});



module.exports = {UsersSchema};