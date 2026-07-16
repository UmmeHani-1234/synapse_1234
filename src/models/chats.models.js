const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
        },

        content: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);