import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, FormControl, Select, MenuItem, InputLabel, Button } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { topics } from '../components/MockInterview/TopicAutoComplete';
import MockInterviewTitle from '../components/MockInterview/MockInterviewTitle';
import ConfirmDialog, { confirmDialog } from '../components/ConfirmDialog';


const InterviewPage = (props) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleStartButtonClick = () => {
    if (topic === '') {
      console.log("No topic selected");
      setError(true);
    }
    else {
      navigate("/questions", { state: { topic: topic, difficulty: difficulty, numberOfQuestions: numberOfQuestions } });
    }
  };

  const handleChange = (event) => {
    if (event.target.name === 'difficulty') {
      setDifficulty(event.target.value);
    } else if (event.target.name === 'numberOfQuestions') {
      setNumberOfQuestions(event.target.value);
    }
    event.preventDefault();
  };

  const handleExit = (event) => {
    confirmDialog('Do you really want to exit?', () =>
      navigate("/")
    );
  };

  return (
    <>
      <MockInterviewTitle />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} mt={10}>
        <form onSubmit={handleStartButtonClick}>
          <Box mb={2}>
            <Autocomplete
              disablePortal
              id="topic"
              name="topic"
              options={topics}
              sx={{ width: 300 }}
              onChange={(event,value) => setTopic(value)}
              renderInput={(params) => <TextField {...params} label="Topic" required />}
            />
          </Box>
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel id="difficulty-label">Difficulty</InputLabel>
              <Select
                name="difficulty"
                labelId="difficulty-label"
                value={difficulty}
                label="Difficulty"
                onChange={handleChange}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box mb={2}>
            <TextField
              name="numberOfQuestions"
              label="Number of Questions"
              type="number"
              value={numberOfQuestions}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <Box mt={2} display="flex" justifyContent='center'>
            <Box mt={2} mr={9}>
              <Button variant="grey" color="secondary" onClick={handleExit}>
                Exit
              </Button>
            </Box>
            <Box mt={2} ml={9}>
              <Button variant="contained" color="primary" type="submit">
                Start
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
      <ConfirmDialog />
    </>
  );
};

export default InterviewPage;
