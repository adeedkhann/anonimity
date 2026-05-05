import { useState, useRef, useEffect } from "react";
import { connectWs } from "./ws";

function App() {
  const [userName, setUserName] = useState("");
  const [inputName, setInputName] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const renderTypingText = () => {
    if (typingUsers.length === 0) return "online";
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2)
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    return `${typingUsers.length} people are typing...`;
  };
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to the group chat",
      sender: "System",
      time: "10:00 AM",
      isMe: false,
    },
  ]);
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);
  const socket = useRef(null);

useEffect(() => {
  // 1. Don't do anything if there's no text or no user
  if (!text.trim() || !userName) return;

  // 2. Set a timeout to emit the event after 500ms of "silence"
  const typingTimer = setTimeout(() => {
    if (socket.current) {
      socket.current.emit("typing", userName);
    }
  }, 500);
  return () => clearTimeout(typingTimer);
}, [text, userName]);

  useEffect(() => {
    socket.current = connectWs();
    socket.current.on("connect", () => {
      socket.current.on("oneJoin", (userName) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `${userName} joined`,
            sender: "System",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: false,
          },
        ]);
      });
      socket.current.on("chatMessage", (message) => {
        const incomingMsg = { ...message, isMe: false };
        setMessages((prev) => [...prev, incomingMsg]);
        console.log(message);
      });




      socket.current.on("typing", (userName) => {
        


        setTypingUsers((prev) => {
          if (prev.includes(userName)) return prev;
          return [...prev, userName];
        });
        // Clear the status after 2 seconds of no typing
       setTimeout(() => {
    setTypingUsers((prev) => prev.filter((user) => user !== userName));
  }, 3000);
      });
    });
  }, []);

  const handleNameSubmit = () => {
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setShowPopup(false);
      socket.current.emit("joinRoom", inputName);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      sender: userName,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    setMessages([...messages, newMessage]);
    console.log(newMessage);
    socket.current.emit("chatMessage", newMessage);
    setText("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen w-full bg-[#f0f0f0] text-black font-sans antialiased">
      {/* Onboarding */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6 text-center">
          <div className="w-full max-w-sm">
            <div className="w-20 h-20 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-white rounded-sm" />
            </div>
            <h1 className="text-2xl font-light mb-8">
              WhatsApp <span className="font-bold">Minimal</span>
            </h1>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-4 border-b-2 border-black focus:outline-none mb-4 text-center text-lg"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            />
            <button
              onClick={handleNameSubmit}
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest active:scale-95 transition-transform"
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      {!showPopup && (
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-[#e5e5e5] shadow-2xl">
          {/* WhatsApp Header */}
          <header className="bg-black text-white px-4 py-3 flex items-center gap-4 shrink-0 shadow-md">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold">
              {userName[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-sm">Anonymous Group</h2>
              {/* Switch between 'online' and 'typing...' */}
              <p className="text-[10px] opacity-70">
                {renderTypingText()}
              </p>
            </div>
            <div className="flex gap-4 text-xl">
              <span>⋮</span>
            </div>
          </header>

          {/* Chat Area with WhatsApp styling */}
          <section className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar overflow-x-hidden">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "System" ? (
                  <div className="mx-auto bg-white/50 px-3 py-1 rounded text-[10px] uppercase tracking-tighter text-gray-600 my-2">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`relative max-w-[85%] px-3 py-1.5 shadow-sm ${
                      msg.isMe
                        ? "bg-black text-white rounded-l-lg rounded-br-lg"
                        : "bg-white text-black rounded-r-lg rounded-bl-lg"
                    }`}
                  >
                    {!msg.isMe && (
                      <p className="text-[10px] font-bold mb-0.5">
                        {msg.sender}
                      </p>
                    )}
                    <p className="text-sm pr-10 leading-snug">{msg.text}</p>
                    <span
                      className={`absolute bottom-1 right-2 text-[9px] ${msg.isMe ? "opacity-60" : "text-gray-400"}`}
                    >
                      {msg.time}
                    </span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </section>

          {/* Input Area */}
          <footer className="bg-white p-3 flex items-center gap-2 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none border border-transparent focus:border-gray-200"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                type="submit"
                className="w-11 h-11 bg-black text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
