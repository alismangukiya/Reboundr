import { Box, Typography } from "@mui/material";

export default function MockInterviewTitle () {
    return(
        <Box
    sx={{display: 'flex', boxShadow: 2}}
    justifyContent='center'>
      <Typography
      variant='h1'
      sx={{display: 'flex', alignContent:'center', fontWeight: 'bold'}}
      >
        Mock Interview
      </Typography>
    </Box>
    );
}