import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotContextType {
  messages: Message[];
  isChatOpen: boolean;
  isLoading: boolean;
  chatMode: 'standard' | 'avancado';
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  clearChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

// Componente para renderizar mensagens com suporte a quebras de linha
function MessageBubble({ text }: { text: string }) {
  return <div style={{ whiteSpace: 'pre-line' }}>{text}</div>;
}

const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou a Melora, sua assistente virtual do Cronograma Modular. Como posso ajudar você hoje?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'standard' | 'avancado'>('standard');

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Olá! Sou a Melora, sua assistente virtual do Cronograma Modular. Como posso ajudar você hoje?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: text }),
      });

      if (!response.ok) {
        throw new Error(`Erro na rede: ${response.statusText}`);
      }

      const data = await response.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.resposta,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setChatMode(data.modo_chat);
    } catch (error) {
      console.error('Erro ao obter resposta do bot:', error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        isChatOpen,
        isLoading,
        chatMode,
        openChat,
        closeChat,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot deve ser usado dentro de um ChatbotProvider');
  }
  return context;
};

export default ChatbotProvider;