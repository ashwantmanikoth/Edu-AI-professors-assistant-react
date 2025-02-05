import React, { useState, useRef, useEffect } from "react";
import PdfViewer from "./PdfViewer";
import { useNavigate } from "react-router-dom";
import { Insights } from "@mui/icons-material";

const ProfessorRoom = (props) => {
  const [parentValue, setParentValue] = useState([]);

  const roomId = sessionStorage.getItem("roomId");
  const userId = sessionStorage.getItem("userEmail");
  const userType = sessionStorage.getItem("userType");

  const [quizNumber, setQuizNumber] = useState(-1);
  const [topic, setTopic] = useState("AWS");

  const [socket, setSocket] = useState(null);

  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log("Inside use effect for web socket connection");
    // Create a new WebSocket connection with gameId, teamName, and userId as query parameters
    const ws_url = "wss://k1p17reb10.execute-api.us-east-1.amazonaws.com/dev";
    const ws_url_with_query_params =
      ws_url + `?roomId=${roomId}&userId=${userId}&userType=${userType}`;
    const ws = new WebSocket(ws_url_with_query_params);

    // Event listener for when the connection is established
    ws.onopen = () => {
      console.log("WebSocket connection established.");
      setSocket(ws); // Save the WebSocket instance to state
    };

    // Event listener for incoming messages from the server
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      if (message.quiz_questions) {
        // setQuizQuestions(message.quiz_questions);
        setData(null)
        setQuizNumber(message.quiz_number);
        setTopic(message.topic);
      }else if(message.insights){
        setData(message.insights);
          console.log(message.insights)
      }
    };

    // Event listener for WebSocket errors
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Event listener for when the connection is closed
    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setSocket(null); // Reset the WebSocket instance when connection is closed
      // Redirect to the home page or any other page as needed
      // navigate('/');
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, []);

  const handleExitRoom = () => {
    // Close the WebSocket connection
    if (socket) {
      const closeMessage = JSON.stringify({
        action: "close",
        roomId: roomId,
      });
      sessionStorage.removeItem("roomId");
      socket.close(1000, closeMessage);
    }
    // Redirect to the home page or any other page as needed
    navigate("/");
  };

  const handleDeleteRoom = async () => {
    const response = await fetch("/room/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: roomId,
      }),
    });

    if (response.status == 200) {
      handleExitRoom();
    }
  };

  // const handleStartQuiz = async () => {
  //   let qNum = 1,
  //     qtopic = "AWS";
  //   const quizDetails = {
  //     roomId,
  //     quizNumber: qNum,
  //     topic: qtopic,
  //   };
  //   console.log(quizDetails);

  //   const response = await fetch("/quiz/startQuiz", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(quizDetails),
  //   });

  //   const startQuizResponse = await response.json();
  //   console.log("startQuizResponse: ", startQuizResponse);

  //   if (response.status == 200) {
  //     setQuizNumber(qNum);
  //     setTopic(qtopic);
  //   }
  // };

  // const handleEndQuiz = async () => {
  //   const quizDetails = {
  //     roomId,
  //     quizNumber,
  //     topic,
  //   };
  //   console.log(quizDetails);

  //   const response = await fetch("/quiz/endQuiz", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(quizDetails),
  //   });

  //   const endQuizResponse = await response.json();
  //   console.log("endQuizResponse: ", endQuizResponse);

  //   if (response.status == 200) {
  //     setQuizNumber(-1);
  //     setTopic("");
  //   }
  // };

  const navigate = useNavigate();

  // Callback function to receive value from the child
  const handleValueChange = (newValue) => {
    setParentValue(newValue);
  };

  return (
    <>
      <div className="page-container">
        <div className="room-id-home">
          <h1>Welcome to the room: {props.roomName}</h1>
          <div className="horizontal-contaner">
            <h2>Room ID: {props.roomId}</h2>
            <p>Share this ID with your students to join.</p>
            {/* <ProfessorRoom /> Uncomment or remove as needed */}

            <button className="btn-create-room" onClick={handleExitRoom}>
              Exit Room
            </button>
            <button className="btn-create-room" onClick={handleDeleteRoom}>
              Delete Room
            </button>
          </div>
        </div>
        <div>
          <div className="horizontal-container">
            <PdfViewer />
          </div>
          <>
            {data && (
              <div className="page-container">
                <div className="room-id-home ease-in">
                  <h2>Quiz Real Time Insights</h2>
                  <p> Total Submissions: {data.total_submissions}</p>
                  <p>Average Score: {data.average_score}</p>
                  <h3>Average Topic Scores:</h3>
                  {Object.entries(data.average_topic_scores).map(
                    ([topic, score]) => (
                      <p key={topic}>
                        {topic}: {score}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default ProfessorRoom;
