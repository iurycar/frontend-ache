import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader } from 'lucide-react';
import { useChatbot } from '../contexts/ChatbotContext';
import { useLocale } from '../contexts/LocaleContext';
import { useTheme } from '../contexts/ThemeContext';

const ChatbotWidget: React.FC = () => {
  const {
    messages,
    isChatOpen,
    isLoading,
    openChat,
    closeChat,
    sendMessage,
  } = useChatbot();
  const { t } = useLocale();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark'; // 🔥 aqui está a correção
  
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isChatOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={openChat}
        className="floating-chat-button"
        aria-label="Abrir assistente"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-80 md:w-96 h-[500px] max-h-[70vh] rounded-lg shadow-xl flex flex-col z-50 animate-slide-in ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between bg-primary text-white p-4 rounded-t-lg">
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-medium">{t('melora_assistant')}</h3>
            <p className="text-xs opacity-80">{t('ask_questions')}</p>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
        }`}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : isDarkMode
                  ? 'bg-gray-600 text-white shadow rounded-tl-none'
                  : 'bg-white text-gray-800 shadow rounded-tl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="block text-[10px] opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="text-left mb-3">
            <div
              className={`inline-block rounded-lg rounded-tl-none px-4 py-2 shadow ${
                isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Loader size={14} className="animate-spin" />
                <span className="text-sm">Digitando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      <div
        className={`p-3 border-t ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}
      >
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('type_message')}
            className={`flex-1 border rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                : 'bg-white text-gray-800 border-gray-300'
            }`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-primary text-white p-2 rounded-r-md ${
              isLoading || !input.trim()
                ? 'opacity-50'
                : 'hover:bg-primary-light'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotWidget;