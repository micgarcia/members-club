const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
  title: { type: String, required: true, maxLength: 100},
  timestamp: { type: String, required: true, maxLength: 100},
  text: { type: String, required: true, maxLength: 500},
  sender: { type: Schema.Types.ObjectId, ref: "Users", required: true}
})

module.exports = mongoose.model("Messages", MessagesSchema);