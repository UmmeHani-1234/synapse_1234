const express = require("express");
const cors = require("cors");

const app = express();

const spaceModel = require("./models/space.models");
const journalModel = require("./models/journal.models");
const Chat = require("./models/chats.models"); // IMPORTANT
const geminiService = require("./services/gemini.services");

app.use(cors());
app.use(express.json());

/* -------------------- SPACES -------------------- */

app.post("/spaces", async (req, res) => {
  try {
    const space = await spaceModel.create(req.body);

    res.status(201).json({
      space,
      message: "Space created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/spaces", async (req, res) => {
  try {
    const spaces = await spaceModel.find();

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
    const journal = await journalModel.find();

    res.json({ journal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- CHAT SYSTEM -------------------- */

/**
 * Create a new chat inside a space
 */
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

/**
 * Get all chats for a space
 */
app.get("/chats/:spaceId", async (req, res) => {
  try {
    const chats = await Chat.find({ spaceId: req.params.spaceId });

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get single chat
 */
app.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * MAIN: send message + AI reply + store both
 */
app.post("/chats/:chatId/message", async (req, res) => {
  try {
    const { message } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 🧠 Get spaceId BEFORE modifying
    const spaceId = chat.spaceId;

    // user message
    chat.messages.push({
      role: "user",
      content: message,
    });

    // AI reply
    const reply = await geminiService.chat(message);

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    // 🔥 INCREMENT MESSAGE COUNT (2 messages added)
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