import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MockInterviewContext } from "../context/MockInterviewContext";
import config from "../config";
import { Box, Typography, Button } from "@mui/material";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ConfirmDialog, { confirmDialog } from '../components/ConfirmDialog';
import { AuthContext } from "../context/AuthContext";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const tableCellClasses = {
  head: "MuiTableCell-head",
  body: "MuiTableCell-body",
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function EvaluationPage() {
  const { qna } = useContext(MockInterviewContext);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const req_token = localStorage.getItem("token") || token;
    const formattedQna = {
      answers: qna.map((question) => {
        return {
          question: question.question,
          answer: question.answer
        };
      })
    };
    let request_config = {
      maxBodyLength: Infinity,
      headers: {
        'Authorization': `Bearer ${req_token}`,
        'Content-Type': 'application/json'
      }
    };
    setIsLoading(true);
    axios.post(`${config.baseUrl}/evaluate`, formattedQna, { headers: request_config.headers }).then((response) => {
      const data = response.data;
      const newRows = qna.map((question, index) => {
        return {
          id: index,
          questionNumber: index + 1,
          question: question.question,
          answer: question.answer,
          evaluation: data[index].evaluation,
          expectedAnswer: data[index].reference,
          rating: data[index].rating,
        };
      });
      setRows(newRows);
      setIsLoading(false);
    }).catch((error) => {
      setIsLoading(false);
      if (error.response.status === 403) {
        navigate("/login");
      }
    });
  }, [qna]);

  const averageRating = rows.reduce((acc, row) => {
    try {
      if (row.rating) {
        const [current, max] = row.rating.split('/');
        const rating = (Number(current) / Number(max)) * 5;
        return acc + rating;
      }
      return acc;
    }
    catch (e) {
      console.log(e);
      return acc;
    }
  }, 0) / rows.length;

  const handleExit = (event) => {
    confirmDialog('Do you really want to exit?', () =>
      navigate("/")
    );
  };

  const handleStartAnother = (event) => {
    confirmDialog('Do you really want to start a new interview?', () =>
      navigate("/interview")
    );
  };

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 2 }}>
      <Box
        sx={{
          m: 2,
          p: 2,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box>
            <Typography
              component="legend"
              variant="subtitle1"
              sx={{ display: "flex", alignContent: "center" }}
            >
              Your rating:
            </Typography>
          </Box>
          <Box>
            <Rating
              name="read-only"
              sx={{ display: "flex", alignContent: "center" }}
              value={averageRating}
              readOnly
            />
          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Question Number</StyledTableCell>
                <StyledTableCell>Question</StyledTableCell>
                <StyledTableCell>Answer</StyledTableCell>
                <StyledTableCell>Evaluation</StyledTableCell>
                <StyledTableCell>Expected Answer</StyledTableCell>
                <StyledTableCell>Rating</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell component="th" scope="row">
                    {row.questionNumber}
                  </StyledTableCell>
                  <StyledTableCell>{row.question}</StyledTableCell>
                  <StyledTableCell>{row.answer}</StyledTableCell>
                  <StyledTableCell>{row.evaluation}</StyledTableCell>
                  <StyledTableCell>{row.expectedAnswer}</StyledTableCell>
                  <StyledTableCell>{row.rating}</StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={2} display="flex" justifyContent='center'>
          <Box mt={2} mr={9}>
            <Button variant="grey" color="secondary" onClick={handleExit}>
              Exit
            </Button>
          </Box>
          <Box mt={2} ml={9}>
            <Button variant="contained" color="primary" onClick={handleStartAnother}>
              Start
            </Button>
          </Box>
        </Box>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
          onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <ConfirmDialog />
      </Box>
    </Box>
  );
}

export default EvaluationPage;