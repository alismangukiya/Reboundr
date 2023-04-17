import { createContext, useState, useEffect } from "react";

const MockInterviewContext = createContext();

const MockInterviewProvider = ({ children }) => {
  const [qna, setQna] = useState([]);

  useEffect(() => {
    const storedQna = localStorage.getItem("qna");
    if (storedQna) {
      setQna(JSON.parse(storedQna));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("qna", JSON.stringify(qna));
  }, [qna]);

  return (
    <MockInterviewContext.Provider value={{ qna, setQna }}>
      {children}
    </MockInterviewContext.Provider>
  );
};

export { MockInterviewContext, MockInterviewProvider };