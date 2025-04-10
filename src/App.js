import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import IframeMessage from "./IframeMessage";
import FullscreenModal from "./FullscreenModal";
import "./App.css";

function App() {
  const [sessionId, setSessionId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullscreenHtml, setFullscreenHtml] = useState(null);
  const chatEndRef = useRef(null);
  const processingRef = useRef(false);

  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const id = uuidv4();
    setSessionId(id);

    axios.get(`http://localhost:8000/welcome/${id}`).then((res) => {
      const welcome = res.data.html
        ? { role: "assistant", iframeContent: res.data.html }
        : { role: "assistant", content: res.data.message || "Welcome!" };
      setChatHistory([welcome]);
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newChat = [...chatHistory, { role: "user", content: input }];
    setChatHistory(newChat);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        user_input: input,
      });

      const assistantMsg = res.data.html
        ? { role: "assistant", iframeContent: res.data.html }
        : { role: "assistant", content: res.data.message || "No response." };

      setChatHistory([...newChat, assistantMsg]);
      console.log("ChatHistory"+chatHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWithInput = async (data) => {
    if (!data.trim() || processingRef.current) return;
  
    processingRef.current = true; // lock it
    setInput("");
    setLoading(true);
  
    const userMsg = { role: "user", content: data };
    setChatHistory(prev => [...prev, userMsg]);
  
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        user_input: data,
      });
  
      const assistantMsg = res.data.html
        ? { role: "assistant", iframeContent: res.data.html }
        : { role: "assistant", content: res.data.message || "No response." };
  
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      processingRef.current = false; // release lock
    }
  };
  const sendChatToServer = async (data, newChat) => {
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        session_id: sessionId,
        user_input: data,
      });
  
      const assistantMsg = res.data.html
        ? { role: "assistant", iframeContent: res.data.html }
        : { role: "assistant", content: res.data.message || "No response." };
  
      setChatHistory((prevChat) => [...prevChat, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
      <div className="top-banner">
         GVEE Bank Fee Refund AI Assistant
      </div>
        <div className="chat-box">
        {chatHistory.map((msg, i) => {
          const isLastAssistant =
            msg.role === "assistant" &&
            [...chatHistory].reverse().find((m) => m.role === "assistant") === msg;

              return (
                <div key={i} className={`chat-message ${msg.role}`}>
                  {msg.role === "assistant" && msg.iframeContent ? (
                    <IframeMessage
                      html={msg.iframeContent}
                      index={i}
                      isActive={isLastAssistant}
                      onClick={() => {
                        if (isLastAssistant) {
                          setFullscreenHtml(msg.iframeContent);
                        }
                      }}
                      handleSendWithInput={handleSendWithInput}
                    />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
              );
        })}

        {loading && (
          <div className="chat-message assistant">
            <span>AI Assistant is typing...</span>
          </div>
        )}

        <div ref={chatEndRef} />
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
        </div>
      </div>

      {fullscreenHtml && (
        <FullscreenModal html={fullscreenHtml} onClose={() => setFullscreenHtml(null)} />
      )}
    </div>
  );
}

export default App;
