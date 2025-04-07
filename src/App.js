import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  useEffect(() => {
    const id = uuidv4();
    setSessionId(id);

    axios.get(`http://localhost:8000/welcome/${id}`)
      .then(res => {
        setChatHistory([{ role: "assistant", content: res.data.welcome_message }]);
      })
      .catch(err => {
        setChatHistory([{ role: "assistant", content: "Welcome! (Failed to load welcome message)" }]);
        console.error(err);
      });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newChat = [...chatHistory, { role: "user", content: input }];
    setChatHistory(newChat);
    setInput("");
    setLoading(true); // Show typing indicator
  
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        user_input: input,
      });
  
      setChatHistory([...newChat, { role: "assistant", content: res.data.response }]);
    } catch (error) {
      setChatHistory([...newChat, { role: "assistant", content: "Oops! Something went wrong." }]);
    } finally {
      setLoading(false); // Hide typing indicator
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f4f6f9', height: '100vh' }}>
    <div className="chat-container">
    <div className="chat-header">
      <div className="header-title">
        <img src="/favicon.ico" alt="GVEE Logo" className="header-icon" />
        <span className="title-text">GVEE Bank Virtual Assistant</span>
      </div>
      <p className="sub-title">Your Secure Digital Banking Support</p>
    </div>
      <div className="chat-box">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
          <span className="typing-indicator">AI Assistant is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  </div>
);
}

export default App;
