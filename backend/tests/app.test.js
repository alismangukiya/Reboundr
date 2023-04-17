require('dotenv').config();
const request = require('supertest');
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const routes = require('../Middleware/routes');
const passportConfig = require('../Middleware/passport');
const User = require('../Models/user');

const app = express(); // Create a new Express application instance
app.use(express.json());
app.use(passport.initialize());
passportConfig(passport);

app.use(routes);

const testUser = {
  email: 'correct@example.com',
  password: 'correct_password',
};

let testUserId;
let token;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  const createdUser = await User.create({ email: testUser.email, password: hashedPassword, firstName: 'John', lastName: 'Doe' , userType: 'jobseeker'});
  testUserId = createdUser._id;
  const res = await request(app)
    .post('/login')
    .send({ email: testUser.email, password: testUser.password });
  token = res.body.token;
});

afterAll(async () => {
  // Remove only the test user that was inserted during the setup
  await User.findByIdAndDelete(testUserId).exec();
});

describe('GET /', () => {
  it('should return "Hello World, from express"', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello World, from express');
  });
});

describe('POST /login', () => {
  it('should return a success message if the email and password are correct', async () => {
    const res = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'correct@example.com', password: 'correct_password' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Login successful.');
  });

  it('should return an error if the email is incorrect', async () => {
    const res = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'wrong@example.com', password: 'password' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Incorrect email.');
  });
});

describe('GET /dashboard', () => {
  it('should redirect to /login if not authenticated', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/login');
  });
});


describe('POST /fetch-questions', () => {
  // ...

  it('should fetch questions for the given topic and difficulty', async () => {
    const res = await request(app)
      .post('/fetch-questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic: 'Sample Topic',
        difficulty: 'easy',
        numberOfQuestions: 3,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.questions.length).toEqual(3);
    expect(res.body.questionIds.length).toEqual(3);
  });
});

describe('POST /interviews', () => {
  let questionAnswers;

  beforeEach(async () => {
    // Fetch questions and their ObjectIds
    const questionsRes = await request(app)
      .post('/fetch-questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic: 'Sample Topic',
        difficulty: 'easy',
        numberOfQuestions: 3,
      });

    // Prepare questionAnswers array
    questionAnswers = questionsRes.body.questionIds.map((questionId, index) => {
      return {
        question: questionId,
        answer: `Answer for question ${index + 1}`,
      };
    });
  });

  afterEach(() => {
    questionAnswers = null;
  });

  // ...

  it('should create a new interview session with questionAnswers', async () => {
    // Create a new interview session
    const res = await request(app)
      .post('/interviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        topic: 'Sample Topic',
        difficulty: 'easy',
        questionAnswers,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.topic).toEqual('Sample Topic');
    expect(res.body.difficulty).toEqual('easy');
    expect(res.body.questionAnswers.length).toEqual(3);
  });
});


describe('GET /getUserProfileDetails', () => {
  it('should return "User Profile"', async () => {
    const res = await request(app).get('/getUserProfileDetails');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('User Profile');
  });
});

describe('POST /addEmploymentDetails', () => {
  it('should return a success message if the text is correct', async () => {
    const res = await request(app)
      .post('/addEmploymentDetails')
      .set('Content-Type', 'application/json')
      .send({ text: 'Message' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Add Employment Details successful.');
  });
});

describe('POST /addProjectDetails', () => {
  it('should return a success message if the text is correct', async () => {
    const res = await request(app)
      .post('/addProjectDetails')
      .set('Content-Type', 'application/json')
      .send({ text: 'Message' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Add Project Details successful.');
  });
});