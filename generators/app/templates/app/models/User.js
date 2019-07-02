'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  changeLog: {
    type: Object,
    default: {
      log: [

      ],
    },
  }}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});


mongoose.model('users', UserSchema);
