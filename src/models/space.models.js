const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema(
  {
    space_title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
  
    icon: {
      type: String,
      default: "Rocket",
    },

    chatTheme: {
      type: String,
      default: "#7C3AED",
    },
    msgs: {
      type: Number,
      default: 0,
    },

    memories: {
      type: Number,
      default: 0,
    },
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Space", spaceSchema);