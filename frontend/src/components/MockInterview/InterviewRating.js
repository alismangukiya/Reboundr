import * as React from 'react';
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';

export default function InterviewRating() {
  const [value, setValue] = React.useState(4);

  return (
    <Box
      sx={{
        '& > legend': { mt: 2 },
        display: 'flex',
      }}
      justifyContent='center'
    >
      <Box>
        <Typography component="legend" variant="subtitle1" sx={{ display: 'flex', alignContent: 'center' }}>Your rating:</Typography>
      </Box>
      <Box>
        <Rating name="read-only" sx={{ display: 'flex', alignContent: 'center' }} value={value} readOnly />
      </Box>
    </Box>
  );
}