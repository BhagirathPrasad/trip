import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import FAQS from '../lib/faqs';
import { useAuth } from '../context/AuthContext';
import { contactAPI } from '../services/api';

const GUEST_KEY = 'chat_messages_guest_v1';
const userKeyFor = (email) => `chat_messages_user_${email}_v1`;

const getAutoResponse = (text) => {
  const t = text.toLowerCase();
  for (const { keywords, response } of FAQS) {
    if (keywords.some((k) => t.includes(k))) return response;
  }
  return "Sorry, I don't have an answer for that. Leave your message and an admin will reply soon or contact support@tripcraft.example.";
};

const ChatWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  // start empty; load guest or user-local + server messages via effects to avoid showing other users' history
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  // persist messages to per-user or guest storage
  useEffect(() => {
    try {
      const key = user ? userKeyFor(user.email) : GUEST_KEY;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
    // scroll to bottom
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, user]);

  // Load appropriate messages when the user changes or widget opens
  useEffect(() => {
    const loadLocalForGuest = () => {
      try {
        const raw = localStorage.getItem(GUEST_KEY);
        if (raw) setMessages(JSON.parse(raw));
        else setMessages([]);
      } catch (e) {
        setMessages([]);
      }
    };

    const loadLocalAndServerForUser = async () => {
      try {
        // start with any user-local saved messages to provide quick UI
        const uKey = userKeyFor(user.email);
        const rawLocal = localStorage.getItem(uKey);
        const localMsgs = rawLocal ? JSON.parse(rawLocal) : [];

        // if widget is open, fetch server messages and prefer those
        if (open) {
          const res = await contactAPI.getMy();
          const contacts = res.data || [];
          const serverMsgs = [];
          contacts.forEach((c) => {
            serverMsgs.push({ id: `${c._id}-user`, sender: 'user', text: c.message, ts: c.created_at });
            if (c.reply) serverMsgs.push({ id: `${c._id}-reply`, sender: 'admin', text: c.reply, ts: c.updated_at || c.created_at });
          });
          // show server messages first, but keep local-only messages (not mapped to server ids)
          const localOnly = localMsgs.filter((m) => !String(m.id).includes('-user') && !String(m.id).includes('-reply'));
          setMessages([...serverMsgs, ...localOnly]);
        } else {
          // if not open yet, show local saved user messages so refresh doesn't show other users' chat
          setMessages(localMsgs);
        }
      } catch (err) {
        console.error('Failed to load messages for user', err);
        setMessages([]);
      }
    };

    if (user) {
      loadLocalAndServerForUser();
    } else {
      // no user -> load guest local messages
      loadLocalForGuest();
    }
  }, [user, open]);

  useEffect(() => {
    // show welcome when opened if empty
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: Date.now(),
            sender: 'bot',
            text: "Hello! I'm TripCraft Assistant. Ask me about bookings, pricing, or say 'help'.",
            ts: new Date().toISOString(),
          },
        ]);
      }, 300);
    }
  }, [open]);

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const trimmed = text.trim();

    // Optimistically add user message
    const userMsg = { id: Date.now(), sender: 'user', text: trimmed, ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // If logged-in, persist to server and refresh server messages
    if (user) {
      try {
        await contactAPI.submit({ name: user.name, email: user.email, message: trimmed });
        // also save optimistically to user's local key
        try {
          const uKey = userKeyFor(user.email);
          const prev = JSON.parse(localStorage.getItem(uKey) || '[]');
          localStorage.setItem(uKey, JSON.stringify([...prev, userMsg]));
        } catch (e) {}

        const res = await contactAPI.getMy();
        const contacts = res.data || [];
        const serverMsgs = [];
        contacts.forEach((c) => {
          serverMsgs.push({ id: `${c._id}-user`, sender: 'user', text: c.message, ts: c.created_at });
          if (c.reply) serverMsgs.push({ id: `${c._id}-reply`, sender: 'admin', text: c.reply, ts: c.updated_at || c.created_at });
        });
        // replace messages: server first + keep local messages that are not server-contained
        setMessages((local) => {
          const localOnly = local.filter((m) => !String(m.id).includes('-user') && !String(m.id).includes('-reply'));
          return [...serverMsgs, ...localOnly];
        });
      } catch (err) {
        console.error('Failed to submit message to server', err);
      }
    } else {
      // guest: persist to guest key
      try {
        const prev = JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
        localStorage.setItem(GUEST_KEY, JSON.stringify([...prev, userMsg]));
      } catch (e) {}
    }

    // Auto-responder for instant replies
    const botReply = getAutoResponse(text);
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, sender: 'bot', text: botReply, ts: new Date().toISOString() },
      ]);
      setTyping(false);
    }, 700 + Math.random() * 800);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div>
      {/* Toggle Button */}
      <button
        data-testid="chat-widget-toggle"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-50 right-6 bottom-6 w-14 h-14 rounded-full bg-teal-700 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Toggle chat widget"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          data-testid="chat-widget-window"
          className="fixed z-50 right-6 bottom-24 w-80 md:w-96 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-teal-700 text-white">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div className="font-semibold">TripCraft Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 p-4 space-y-3 overflow-auto max-h-64 bg-stone-50">
            {messages.length === 0 ? (
              <div className="text-center text-stone-400">No messages yet. Ask me anything.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'bot' || m.sender === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      m.sender === 'bot' || m.sender === 'admin' ? 'bg-white border border-stone-200 text-stone-900' : 'bg-teal-700 text-white'
                    }`}
                    data-testid={`chat-msg-${m.id}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 px-3 py-2 rounded-lg text-sm text-stone-900">Typing...</div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="p-3 border-t border-stone-100 bg-white">
            <div className="flex gap-2">
              <input
                data-testid="chat-widget-input"
                className="flex-1 h-10 rounded-lg border border-stone-200 px-3 text-sm focus:outline-none"
                placeholder="Ask me about bookings, price, or help..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                type="button"
                data-testid="chat-widget-send-btn"
                onClick={() => sendMessage(input)}
                className="bg-teal-700 text-white px-4 rounded-lg h-10 text-sm"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
