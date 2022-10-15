const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 50},
  last_name: { type: String, required: true, maxLength: 50},
  username: { type: String, required: true, maxLength: 75},
  password: { type: String, required: true, maxLength: 100},
  member_status: { type: String, required: true, maxLength: 50}
})

module.exports = mongoose.model("Users", UsersSchema);