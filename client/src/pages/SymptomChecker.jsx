import React, { useState, useRef, useEffect } from 'react';

const API_URL = '/api/ai-chat';

const SymptomChecker = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages(data.length > 0 ? data : [{ sender: 'ai', text: 'Hello! I am your AI Symptom Checker. Please describe your symptoms.' }]);
      } catch (err) {
        setError('Could not load chat history.');
        setMessages([{ sender: 'ai', text: 'Hello! I am your AI Symptom Checker. Please describe your symptoms.' }]);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);
    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: userMsg.text })
      });
      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();
      setMessages((prev) => [...prev, ...data]);
    } catch (err) {
      setError('Could not get AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 animate-fade-in" style={{ maxWidth: 600, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <h2 className="mb-3 text-center fw-bold text-primary" style={{ letterSpacing: 1 }}>AI Symptom Checker</h2>
      <div className="flex-grow-1 overflow-auto mb-3 p-3 rounded-4 bg-light shadow-sm" style={{ minHeight: 300, maxHeight: '60vh' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={`p-2 px-3 rounded-3 ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white border text-dark'}`} style={{ maxWidth: '80%' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="d-flex mb-2 justify-content-start">
            <div className="p-2 px-3 rounded-3 bg-white border text-dark" style={{ maxWidth: '80%' }}>
              <span className="spinner-border spinner-border-sm me-2"></span>Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      {error && <div className="alert alert-danger text-center mb-2 animate-pop-in">{error}</div>}
      <form onSubmit={handleSend} className="d-flex gap-2 align-items-center mt-auto">
        {/* Future: Add voice/image buttons here */}
        <input
          type="text"
          className="form-control"
          placeholder="Type your symptoms..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary fw-bold" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default SymptomChecker; 