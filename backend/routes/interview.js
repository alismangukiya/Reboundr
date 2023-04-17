require('dotenv').config();
const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");
const utils = require('../Middleware/utils');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const Interview = require('../Models/MockInterview/Interview');
const Topic = require('../Models/MockInterview/Topic');
const Question = require('../Models/MockInterview/Question');
const { isAuthenticated } = require('../Middleware/utils');
const openai = new OpenAIApi(configuration);

router.post('/interviews', isAuthenticated, async (req, res) => {
    const { topic, difficulty, questionAnswers } = req.body;

    try {
        // Validate user input
        if (!topic || !difficulty || !questionAnswers) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Create a new Interview document
        const interview = new Interview({
            user: req.user.id,
            topic,
            difficulty,
            questionAnswers,
        });

        await interview.save();

        // Return the created Interview document
        res.status(201).json(interview);
    } catch (error) {
        console.error('Error in POST /interviews:', error);
        res.status(500).json({ message: 'Error creating interview session.' });
    }
});

router.post('/fetch-questions', isAuthenticated, async (req, res) => {
    const { topic, difficulty, numberOfQuestions } = req.body;

    try {
        // Validate user input
        if (!topic || !difficulty || !numberOfQuestions) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Fetch questions from the OpenAI API
        const questions = [];
        let useFallback = false;

        try {
            const response = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: `Generate ${numberOfQuestions} interview questions on the topic of ${topic} with a difficulty level of ${difficulty}. You may also ask any question(s) that come(s) under the ${topic} umbrella.`,
                temperature: 0.9,
                max_tokens: 100,
            });
            const questionArray = response.data.choices[0].text
                .split('\n')
                .map((question) => question.trim())
                .filter((question) => question.length > 0);
            questions.push(...questionArray);
        } catch (error) {
            if (error.status === 429) {
                useFallback = true;
            } else {
                console.error('Error in POST /interviews:', error);
                return res.status(500).json({ message: 'Error creating interview session.' });
            }
        }

        // Fallback: Fetch questions from the MongoDB database
        if (useFallback) {
            const dbQuestions = await Question.find({ topic, difficulty })
                .limit(numberOfQuestions)
                .exec();

            if (dbQuestions.length === 0) {
                return res
                    .status(404)
                    .json({ message: 'No questions found for the selected topic and difficulty.' });
            }

            dbQuestions.forEach((question) => questions.push(question.text));
        }

        // Check if the questions array contains another array and flatten it
        const flattenedQuestions = Array.isArray(questions[0]) ? questions[0] : questions;

        // Save the questions to the database
        const questionIds = await utils.saveQuestions(flattenedQuestions, topic, difficulty);

        // Return the fetched questions
        res.status(200).json({ questions: flattenedQuestions, questionIds });
    } catch (error) {
        console.error('Error in POST /fetch-questions:', error);
        res.status(500).json({ message: 'Error fetching questions.' });
    }
});

router.post('/evaluate', isAuthenticated, async (req, res) => {
    const { answers } = req.body;

    try {
        // Validate user input
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid input data.' });
        }

        const results = [];

        for (const answer of answers) {
            const prompt = `Kindly evaluate my answer and provide a critical comment in short only if necessary, specifically related to the interview question. Also use bullet list format and include a line space between points. Interview Question: ${answer.question}. My answer: ${answer.answer}.\n\nPlease rate my answer on a scale of 1 to 5, with 5 being the highest possible score.`;
            const res_prompt = `Provide a thorough and accurate interview answer in short to the following interview question - ${answer.question} , including any additional information or clarification requested in the inquiry. Include proper spacing and line breaks after every line.`;
            const response = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt,
                temperature: 0.1,
                max_tokens: 300,
            });

            const output = response.data.choices[0].text;
            const lines = output.split('\n');
            const ratingRegex = /\b(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?/;
            const ratingMatch = lines.find(line => ratingRegex.test(line));
            const rating = ratingMatch ? ratingMatch.match(ratingRegex)[0] : null;
            const evaluationRegex = /^\s*(?<rating>\d+(?:\.\d+)?)(?:\/\d+)?\s*(?<evaluation>[\s\S]+)?/;
            const match = output.match(evaluationRegex);
            const evaluation = match?.groups?.evaluation?.trim() ?? '';
            const res = await openai.createCompletion({
                model: 'text-davinci-003',
                prompt: res_prompt,
                temperature: 0.1,
                max_tokens: 300,
            });

            results.push({
                question: answer.question,
                answer: answer.answer,
                rating: rating,
                evaluation: evaluation,
                reference: res.data.choices[0].text,
            });
        }
        res.status(200).json(results);
    } catch (error) {
        console.error('Error in POST /evaluate:', error);
        res.status(500).json({ message: 'Error evaluating answers.' });
    }
});

router.get('/topics', async (req, res) => {
    try {
        const topics = await Topic.find({}).exec();
        res.status(200).json(topics);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving topics.' });
    }
});

module.exports = router;