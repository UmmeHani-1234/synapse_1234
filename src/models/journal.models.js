const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({

  journal_title: String,
  description: String,

});
const journalModel = mongoose.model('journal', JournalSchema);
module.exports = journalModel;


 