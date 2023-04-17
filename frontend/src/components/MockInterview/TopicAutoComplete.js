import { useEffect } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import config from '../../config';

export default function TopicAutoComplete(error) {
  useEffect(() => {
    axios.get(`${config.baseUrl}/topics`,)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  },[]);
  return (
    <Autocomplete
      disablePortal
      id="topic"
      name="topic"
      options={topics}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Topic" required />}
    />
  );
}

export const topics = [
  'Python',
  'Java',
  'JavaScript',
  'C++',
  'C#',
  'Unity',
  'Go',
  'Behavioral',
  'HR',
  'React',
  'Angular',
  'ML',
  'AWS',
  'SQL'
];