require('dotenv').config();
const jwt = require('jsonwebtoken');
const Question = require('../Models/MockInterview/Question');


async function saveQuestions(questions, topic, difficulty) {
    const questionIds = [];

    for (const questionText of questions) {
        const existingQuestion = await Question.findOne({ text: questionText }).exec();

        if (existingQuestion) {
            questionIds.push(existingQuestion._id);
        } else {
            const newQuestion = new Question({ text: questionText, topic, difficulty });
            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }
    }

    return questionIds;
}

async function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Error in isAuthenticated:', err); // Add this line to log the error
                return res.status(403).json({ message: 'Forbidden' });
            }

            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = {
    saveQuestions,
    isAuthenticated,
};