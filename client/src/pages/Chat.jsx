import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaUserCircle, FaComments } from 'react-icons/fa';

function getUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

const Chat = ({ otherUserId }) => {
  const user = getUserFromToken();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState('User');
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Fetch recent conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/messages/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setConversations(await res.json());
        }
      } catch {}
    };
    fetchConversations();
  }, [otherUserId]);

  useEffect(() => {
    if (!otherUserId) return;
    // Fetch other user's name
    const fetchOtherUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOtherUserName(data.name || data.email || 'User');
        }
      } catch {}
    };
    fetchOtherUser();
  }, [otherUserId]);

  useEffect(() => {
    if (!otherUserId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/messages/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data);
      } catch {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver: otherUserId, text }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setText('');
      // Refresh messages
      const fetchRes = await fetch(`/api/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(await fetchRes.json());
    } catch {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  if (!otherUserId) return <div className="container py-5 text-center"><FaComments className="mb-2 text-primary" size={32} /><div>Select a user to chat with.</div></div>;
  if (loading) return <div className="container py-5 text-center">Loading chat...</div>;

  return (
    <div className="container py-5 animate-fade-in" style={{ maxWidth: 1000, display: 'flex', gap: 32 }}>
      {/* Sidebar: Recent Conversations */}
      <div style={{ width: 260, marginRight: 0 }}>
        <h5 className="mb-3 fw-bold text-primary"><FaComments className="me-2" />Recent Chats</h5>
        <ul className="list-group rounded-4 shadow-sm">
          {conversations.length === 0 ? (
            <li className="list-group-item text-muted">No conversations</li>
          ) : conversations.map(conv => (
            <li key={conv._id} className={`list-group-item d-flex align-items-center gap-2 ${conv._id === otherUserId ? 'active' : ''}`} style={{ cursor: 'pointer', borderLeft: conv._id === otherUserId ? '4px solid #0d6efd' : 'none', background: conv._id === otherUserId ? '#f0f6ff' : '' }} onClick={() => navigate(`/chat/${conv._id}`)}>
              <FaUserCircle className="text-secondary" size={28} />
              <div className="flex-grow-1">
                <div className="fw-bold">{conv.name || conv.email}</div>
                <div className="small text-muted">{conv.lastMessage ? new Date(conv.lastMessage).toLocaleDateString() : ''}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Main Chat Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bg-white rounded-4 shadow-lg p-4 mb-3 animate-fade-in" style={{ minHeight: 400, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4 text-primary fw-bold">Chat with {otherUserName}</h3>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
            {messages.length === 0 ? (
              <div className="text-muted text-center">No messages yet.</div>
            ) : messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-2 ${msg.sender === user.id ? 'justify-content-end' : 'justify-content-start'}` }>
                <div className={`p-2 rounded-3 ${msg.sender === user.id ? 'bg-primary text-white' : 'bg-light border'}`} style={{ maxWidth: '70%', minWidth: 80, wordBreak: 'break-word', boxShadow: msg.sender === user.id ? '0 2px 8px #0d6efd22' : '0 2px 8px #0001' }}>
                  <div>{msg.text}</div>
                  <div className="small text-muted text-end">{new Date(msg.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSend} className="d-flex gap-2 mt-2">
            <input className="form-control rounded-3" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." disabled={sending} style={{ fontSize: 16 }} />
            <button className="btn btn-primary px-4 d-flex align-items-center gap-2" type="submit" disabled={sending || !text.trim()}><FaPaperPlane /> Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 