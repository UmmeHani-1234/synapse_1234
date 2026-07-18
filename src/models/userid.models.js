const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  space_title: {
    type: String,
    required: true
  },

  description: String,
  icon: String,
  chatTheme: String
}, {
  timestamps: true
});

module.exports = mongoose.model("Space", spaceSchema);