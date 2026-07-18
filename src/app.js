const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const app = express();

const spaceModel = require("./models/space.models");
const journalModel = require("./models/journal.models");
const Chat = require("./models/chats.models");
const geminiService = require("./services/gemini.services");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

/* -------------------- SPACES --------------------
   NOTE: these routes (and /journal, /chats below) currently trust
   whatever userId the client sends, with no auth check. Anyone who
   knows or guesses a userId can read or write that user's data.
   Recommend adding a verifyToken middleware here (checking whatever
   your login flow issues) and deriving userId from the verified
   token instead of req.query/req.body.
------------------------------------------------- */

app.post("/spaces", async (req, res) => {
  try {
    const space = await spaceModel.create(req.body);

    // Return the space directly — CreateSpace.tsx reads dbSpace._id
    // off the top-level response, so wrapping it in { message, space }
    // meant that id was always undefined and every new space fell
    // back to a fake local id, showing up twice once the real one
    // synced from the DB.
    res.status(201).json(space);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/spaces", async (req, res) => {
  try {
    const { userId } = req.query;

    // Without this check, a missing/undefined userId means Mongo/Mongoose
    // just drops the key from the filter and find({ userId }) becomes
    // find({}) — silently returning every user's spaces instead of none.
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "A valid userId is required" });
    }

    const spaces = await spaceModel.find({ userId });

    res.json({ spaces });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- JOURNAL -------------------- */

app.post("/journal", async (req, res) => {
  try {
    const journal = await journalModel.create(req.body);

    res.status(201).json({ journal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/journal", async (req, res) => {
  try {
    const { userId } = req.query;

    // Same issue as /spaces: an unfiltered/undefined userId would
    // otherwise silently return every user's journal entries.
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "A valid userId is required" });
    }

    const journal = await journalModel.find({ userId });

    res.json({ journal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- CHAT SYSTEM -------------------- */

app.post("/chats", async (req, res) => {
  try {
    const { spaceId } = req.body;

    const chat = await Chat.create({
      spaceId,
      title: "New Chat",
      messages: [],
    });

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/chats/:spaceId", async (req, res) => {
  try {
    const chats = await Chat.find({
      spaceId: req.params.spaceId,
    });

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/chats/:chatId/message", async (req, res) => {
  try {
    const { message } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    const spaceId = chat.spaceId;

    chat.messages.push({
      role: "user",
      content: message,
    });

    const reply = await geminiService.chat(message);

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    await spaceModel.findByIdAndUpdate(spaceId, {
      $inc: { msgs: 2 },
    });

    res.json({
      reply,
      chat,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;