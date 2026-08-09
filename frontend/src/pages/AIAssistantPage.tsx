import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  Avatar,
  CircularProgress,
  Chip,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  entities?: {
    location?: string[];
    people?: string[];
    budget?: string[];
    amenities?: string[];
  };
}

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `Hello ${user?.fullName?.split(' ')[0] || 'Traveler'}! 👋 I am your NLP-powered Smart Travel Assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Query our local Java NLP controller gateway
      const url = apiClient.defaults.baseURL ? apiClient.defaults.baseURL.replace('/v1', '/nlp/chat') : '/api/nlp/chat';
      const response = await apiClient.post(url, {
        message: userMessage.text,
      });

      const data = response.data;

      const botMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: data.intent,
        entities: data.entities,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: "I'm having trouble connecting to my local NLP brain engine. Please make sure the backend services are fully running.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggest = (text: string) => {
    setInput(text);
  };

  return (
    <Box sx={{ pb: 4, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      {/* Upper header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" sx={{ fontSize: 32 }} /> Smart Travel Assistant
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Trained on NLTK Naive Bayes NLP intent models to parse booking requests, tourist spots, and flight details.
        </Typography>
      </Box>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            "I want to book a hotel in Dubai for 4 people",
            "What are the best restaurants in Paris?",
            "What tourist spots are in Jordan?",
            "I need a visa to enter Saudi Arabia",
          ].map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              onClick={() => handleSuggest(suggestion)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.12)',
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Conversational Chat Box */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(11, 19, 41, 0.25)',
          backdropFilter: 'blur(16px)',
          mb: 2,
        }}
      >
        {/* Messages List Area */}
        <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            
            // Check if we should display a quick action link
            const isBookingIntent = msg.intent && ['hotel_booking', 'trip_planning', 'trip_booking'].includes(msg.intent);
            const locationEntity = msg.entities?.location?.length ? msg.entities.location[0] : null;

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isBot ? 'flex-start' : 'flex-end',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                {isBot && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34, boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)' }}>
                    <SmartToyIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}

                <Box sx={{ maxWidth: '70%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      backgroundColor: isBot ? 'rgba(255, 255, 255, 0.04)' : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      background: isBot ? undefined : 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      border: isBot ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#F8FAFC' }}>
                      {msg.text}
                    </Typography>
                  </Paper>

                  {/* Dynamic Action Card based on NLTK entities */}
                  {isBot && isBookingIntent && locationEntity && (
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        bgcolor: 'rgba(59, 130, 246, 0.06)',
                        border: '1px dashed rgba(59, 130, 246, 0.3)',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="primary.light" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700 }}>
                          <AutoAwesomeIcon sx={{ fontSize: 14 }} /> QUICK ACTION
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                          Plan trip to {locationEntity} now
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/trips/create?dest=${encodeURIComponent(locationEntity)}`)}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        Start
                      </Button>
                    </Paper>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, ml: isBot ? 0.5 : 0, textAlign: isBot ? 'left' : 'right' }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>

                {!isBot && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}>
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                )}
              </Box>
            );
          })}

          {/* Typing Indicator loader */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}>
                <SmartToyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  px: 2.5,
                  borderRadius: '4px 16px 16px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CircularProgress size={16} color="primary" />
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Chat input fields bar */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', bgcolor: 'rgba(3, 7, 18, 0.2)' }}>
          <Stack direction="row" spacing={1.5}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about travel guides, visa rules, or Cairo hotels..."
              fullWidth
              size="medium"
              disabled={loading}
              autoComplete="off"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                  color: 'text.disabled',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};
