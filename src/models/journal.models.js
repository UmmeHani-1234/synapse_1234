const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  journal_title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}

}, {
  timestamps: true
});

const journalModel = mongoose.model('journal', JournalSchema);

module.exports = journalModel;