"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Farm, getAIResponse } from '@/utils/mockData';
import { useApp } from '@/context/AppContext';
import { Send, Bot, User, Sparkles, AlertCircle, Mic, Volume2 } from 'lucide-react';
import axios from 'axios';

interface AIChatProps {
  farm: Farm;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIChat({ farm }: AIChatProps) {
  const { apiConnected } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello! I am your TerraTwin AI Copilot. I am linked to the Digital Twin of **${farm.name}**. I can analyze soil chemistry, predict crop yield, schedule irrigation, or evaluate plant health stress. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleSend(transcript);
        };
        
        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, [speechLang]);

  // Read response text aloud using SpeechSynthesis
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel active playback
      
      const cleanText = text.replace(/\*\*|__/g, ''); // Strip markdown highlights
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = speechLang;
      
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(speechLang.split('-')[0]));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Local Web Speech Recognition API is not supported on this browser version.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = speechLang;
      recognitionRef.current.start();
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Refresh greeting when selected farm changes
  useEffect(() => {
    setMessages([
      {
        id: `msg-init-${farm.id}`,
        sender: 'ai',
        text: `Hello! I am your TerraTwin AI Copilot. I am linked to the Digital Twin of **${farm.name}**. I can analyze soil chemistry, predict crop yield, schedule irrigation, or evaluate plant health stress. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [farm.id, farm.name]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    if (apiConnected) {
      const token = localStorage.getItem('token');
      axios.post(`http://localhost:8000/api/chat/${farm.id}`, { query: textToSend }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data && res.data.response) {
          const aiMsg: Message = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: res.data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
          speakText(res.data.response);
        } else {
          throw new Error("Empty query response");
        }
      })
      .catch(() => {
        // Fallback to offline mock response generator
        const aiReplyText = getAIResponse(textToSend, farm);
        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(aiReplyText);
      })
      .finally(() => {
        setIsTyping(false);
      });
    } else {
      // Standalone Offline mode
      setTimeout(() => {
        const aiReplyText = getAIResponse(textToSend, farm);
        const aiMsg: Message = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(aiReplyText);
        setIsTyping(false);
      }, 1200);
    }
  };

  const suggestions = [
    "Check NPK nutrient balance",
    "Should I trigger irrigation?",
    "Predict next crop yield",
    "What is the disease risk level?"
  ];

  return (
    <div className="bg-white dark:bg-text-main border border-surface-container-highest dark:border-white/10 rounded-2xl shadow-sm flex flex-col h-[600px] overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-container-highest dark:border-white/10 bg-primary-light dark:bg-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main dark:text-white">TerraTwin AI Copilot</h3>
            <div className="text-[10px] text-text-secondary dark:text-surface-container-highest/60 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-ping"></span>
              <span>Context: {farm.name}</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
      </div>

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAI ? 'bg-primary-light text-primary' : 'bg-primary text-white'}`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isAI ? 'bg-background dark:bg-white/5 text-text-main dark:text-white rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                  {/* Simplistic markdown bold parser */}
                  {msg.text.split('**').map((chunk, idx) => 
                    idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-primary dark:text-secondary">{chunk}</strong> : chunk
                  )}
                  {isAI && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="ml-2 inline-flex items-center text-primary/70 hover:text-primary active:scale-95"
                      title="Read response aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-text-secondary dark:text-surface-container-highest/40 font-mono block text-right px-1">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-background dark:bg-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="px-6 py-2 flex flex-wrap gap-2">
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSend(sug)}
              className="text-[10px] font-semibold text-primary bg-primary-light hover:bg-primary/20 dark:bg-white/5 dark:text-white border border-primary/10 rounded-full px-3 py-1 transition-all"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Language Selector Row */}
      <div className="px-4 py-1.5 border-t border-surface-container-highest dark:border-white/5 flex items-center justify-between bg-background dark:bg-white/5">
        <span className="text-[9px] font-bold text-text-secondary dark:text-surface-container-highest/60 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Gemini multi-language speech engine active</span>
        </span>
        <select
          value={speechLang}
          onChange={(e) => setSpeechLang(e.target.value)}
          className="text-[10px] font-bold bg-transparent dark:text-white focus:outline-none cursor-pointer text-primary border-none"
        >
          <option value="en-US">English</option>
          <option value="te-IN">Telugu (తెలుగు)</option>
          <option value="hi-IN">Hindi (हिन्दी)</option>
          <option value="ta-IN">Tamil (தமிழ்)</option>
          <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
          <option value="ml-IN">Malayalam (മലയാളം)</option>
          <option value="mr-IN">Marathi (మராठी)</option>
          <option value="gu-IN">Gujarati (ગુજરાતી)</option>
          <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
          <option value="bn-IN">Bengali (বাংলা)</option>
        </select>
      </div>

      {/* Chat Terminal Inputs */}
      <div className="p-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
          placeholder={`Ask about NPK levels, moisture, yield forecast...`}
          className="flex-1 bg-background dark:bg-white/5 dark:text-white text-xs px-4 py-3 rounded-xl border border-surface-container-highest dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        
        {/* Microphone Voice Input Toggle */}
        <button
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all shadow-md ${isListening ? 'bg-error text-white animate-pulse' : 'bg-background hover:bg-surface-container-highest text-text-secondary dark:bg-white/5 dark:hover:bg-white/10'}`}
          title="Toggle Voice dictation"
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => handleSend(inputText)}
          disabled={!inputText.trim()}
          className="p-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-primary/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
