import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, Button, Tooltip, Typography, FormControl, InputLabel, OutlinedInput, Grid, Icon, IconButton } from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import LinearProgressWithLabel from "../components/LinearProgressWithLabel";
import MockInterviewTitle from '../components/MockInterview/MockInterviewTitle';
import ConfirmDialog, { confirmDialog } from '../components/ConfirmDialog';
import config from "../config";
import { MockInterviewContext } from "../context/MockInterviewContext";
import { AuthContext } from "../context/AuthContext";


function QuestionsPage({ data }) {
  const navigate = useNavigate();
  const location = useLocation();
  const interviewConfig = location.state;
  const [answers, setAnswers] = useState([]);
  const [isRecorded, setIsRecorded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [progress, setProgress] = useState(0);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [tempAnswer, setTempAnswer] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const {token, setToken} = useContext(AuthContext);
  useEffect(() => {
    let request_config = {
      maxBodyLength: Infinity,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    axios.post(`${config.baseUrl}/fetch-questions`, {
      topic: interviewConfig.topic, difficulty: interviewConfig.difficulty, numberOfQuestions: interviewConfig.numberOfQuestions
    },
      {
        headers: request_config.headers
      },)
      .then((response) => {
        setQuestions(response.data.questions);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          navigate("/login");
        }
      });

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.log("Browser does not support speech recognition!");
    }
  }, []);
  const handleStartRecording = () => {
    // clearing out the previous speech text
    resetTranscript();

    // start listening for speech recognition
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  const handleMicClick = () => {
    setIsRecorded(!isRecorded);
    if (!isRecorded) {
      handleStartRecording();
    }
    else {
      handleStopRecording();
    }
  }

  const handleStopRecording = () => {
    SpeechRecognition.stopListening();
  };

  const handleSubmitAnswer = () => {
    setAnswers((prev) => {
      let arr = [...prev];
      arr.push({ answer: transcript });
      return arr;
    });
    setDisableSubmit(true);
  };

  const handleClearAnswer = () => {
    resetTranscript();
  };
  const { setQna } = useContext(MockInterviewContext);
  const handleNextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      let qna = questions.map((question, index) => {
        return { question: question, answer: answers[index].answer }
      });
      setQna([...qna]);
      navigate("/evaluation", { state: { qna } });
    }
    setCurrentQuestion(currentQuestion + 1);
    resetTranscript();
    setProgress(((currentQuestion + 1) / questions.length) * 100);
    setIsRecorded(false);
    setDisableSubmit(false);
  };

  const handleExit = (event) => {
    confirmDialog('Do you really want to exit?', () =>
      navigate("/")
    );
  };

  return (
    <>
      <MockInterviewTitle />
      <LinearProgressWithLabel value={progress} />
      <Grid container alignItems="center" direction="column" spacing={2}>
        <Grid item>
          <Grid container direction="row" spacing={4}>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="h4" gutterBottom>Topic: {interviewConfig.topic}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h4" gutterBottom>Difficulty: {interviewConfig.difficulty}</Typography>
        </Grid>
        <Grid container item>
          <Grid item xs={1} md={3} lg={4}></Grid>
          <Grid item xs={10} md={6} lg={4}>
            <FormControl variant="outlined" style={{ position: 'relative' }} fullWidth>
              <InputLabel htmlFor="outlined-multiline-flexible" shrink style={{ position: 'absolute', top: '-8px', left: '14px', backgroundColor: '#fff', paddingLeft: '4px', paddingRight: '4px' }}>
                {"Question " + (currentQuestion + 1)}
              </InputLabel>
              <OutlinedInput
                id="outlined-multiline-flexible"
                value={questions[currentQuestion]}
                multiline
                maxRows={4}
                inputProps={{ 'aria-label': 'Question' }}
                labelwidth={0}
              />
            </FormControl>
          </Grid>
          <Grid item xs={1} md={3} lg={4}></Grid>
        </Grid>
        <Grid container item>
          <Grid item xs={1} md={3} lg={4}></Grid>
          <Grid item xs={10} md={6} lg={4}>
            <TextField
              id="answer"
              label="Answer"
              multiline
              rows={4}
              variant="outlined"
              value={transcript || ''}
              onChange={(event) => setTempAnswer(event.target.value)}
              fullWidth
            />
          </Grid>
          <Grid container item xs={1} md={2} lg={2} direction="row" alignItems="center">
            <Tooltip title="Click to start/stop recording your answer" open={showTooltip}>
              <IconButton
                disabled={disableSubmit}
                onClick={handleMicClick}
              >
                <Icon
                  component={isRecorded ? Mic : MicOff}
                  color={isRecorded ? 'success' : 'action'}
                  onMouseEnter={() => setShowTooltip(false)}
                />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid container item spacing={1}>
          <Grid item xs md></Grid>
          <Grid item xs={4} md={2}>
            <Button variant="contained" color="error" onClick={handleClearAnswer} disabled={disableSubmit} fullWidth>
              Clear
            </Button>
          </Grid>
          <Grid item xs={4} md={2}>
            <Button
              variant="contained"
              color="primary"
              disabled={(!tempAnswer && isRecorded) || disableSubmit}
              onClick={handleSubmitAnswer}
              fullWidth
            >
              Submit
            </Button>
          </Grid>
          <Grid item xs md></Grid>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={1} md={1}></Grid>
        <Grid item xs={4} md={1}>
          <Button variant="gray" onClick={handleExit} fullWidth>
            Exit
          </Button>
        </Grid>
        <Grid item xs md></Grid>
        <Grid item xs={4} md={1}><Button
          variant="contained"
          onClick={handleNextQuestion}
          fullWidth
        >
          {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
        </Button></Grid>
        <Grid item xs={1} md={1}></Grid>
      </Grid>
      <ConfirmDialog />
    </>
  );
}

export default QuestionsPage;
