const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  topic: {
    type: String,
    ref: 'Topic',
    required: true,
  },
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;