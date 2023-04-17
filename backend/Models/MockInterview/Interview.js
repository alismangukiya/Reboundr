const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    ref: 'Topic',
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  questionAnswers: [{
    question: {
      type: String,
      ref: 'Question',
    },
    answer: {
      type: String,
      ref: 'Answer',
    },
    evaluation: {
      type: String,
      ref: 'Evaluation',
    },
    rating: {
      type: Number,
      ref: 'Rating',
    },
  }],
});

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;