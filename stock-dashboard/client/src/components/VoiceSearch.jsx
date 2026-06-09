import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Search, Loader2 } from 'lucide-react';

const VoiceSearch = ({ onSearchResult }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice search is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const transcriptText = current[0].transcript;
      setTranscript(transcriptText);

      if (current.isFinal) {
        handleVoiceCommand(transcriptText);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('Microphone not found. Please check your microphone.');
      } else {
        setError(`Error: ${event.error}. Please try again.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const handleVoiceCommand = (text) => {
    const lowerText = text.toLowerCase().trim();
    
    // Extract stock symbol or search query
    const symbolMatch = lowerText.match(/\b(?:stock|symbol|ticker)\s+([a-z]{1,5})\b/i);
    const searchMatch = lowerText.match(/\b(?:search|find|look up|show)\s+([a-z\s]+)\b/i);
    const symbolOnly = lowerText.match(/\b[A-Za-z]{1,5}\b/);

    let query = '';

    if (symbolMatch) {
      query = symbolMatch[1].toUpperCase();
    } else if (searchMatch) {
      query = searchMatch[1].trim();
    } else if (symbolOnly) {
      query = symbolOnly[0].toUpperCase();
    }

    if (query) {
      if (onSearchResult) {
        onSearchResult(query);
      }
      // Navigate to stock detail if it looks like a symbol
      if (/^[A-Z]{1,5}$/.test(query)) {
        navigate(`/stock/${query}`);
      } else {
        navigate(`/?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 animate-pulse'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title={t('search.voice')}
        disabled={!isSupported}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl p-4 z-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('search.listening')}
            </span>
          </div>
          {transcript && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{transcript}"</p>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Say "Stock AAPL", "Search Tesla", or just a symbol
          </p>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl shadow-xl p-3 z-50">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-500 hover:text-red-700 mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Browser support warning */}
      {!isSupported && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl shadow-xl p-3 z-50">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Voice search requires Chrome, Edge, or Safari.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;