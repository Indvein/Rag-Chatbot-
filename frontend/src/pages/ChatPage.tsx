import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import OnboardingModal from '../components/OnboardingModal';
import type { Message } from '../types';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi, upload a PDF and I will help you understand, summarize, and search through it.\n\n*(Note: This app is hosted on a free Render instance. The first reply might take 30-50 seconds as the AI wakes up!)*"
    }
  ]);
  const [totalTokens, setTotalTokens] = useState<number>(() => {
    const saved = localStorage.getItem('totalTokens');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [language, setLanguage] = useState<string>('English');
  
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('groqApiKey'));
  const [isTrial, setIsTrial] = useState<boolean>(() => localStorage.getItem('trialMode') === 'true');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!apiKey && !isTrial);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('groqApiKey', key);
    localStorage.removeItem('trialMode');
    setApiKey(key);
    setIsTrial(false);
    setShowOnboarding(false);
  };

  const handleStartTrial = () => {
    localStorage.setItem('trialMode', 'true');
    localStorage.removeItem('groqApiKey');
    setApiKey(null);
    setIsTrial(true);
    setShowOnboarding(false);
  };

  useEffect(() => {
    localStorage.setItem('totalTokens', totalTokens.toString());
  }, [totalTokens]);

  return (
    <div className="flex h-screen flex-col md:flex-row bg-bg-main overflow-hidden font-geist selection:bg-accent selection:text-accent-text relative">
      {showOnboarding && <OnboardingModal onSaveKey={handleSaveKey} onStartTrial={handleStartTrial} />}
      <Sidebar 
        setMessages={setMessages} 
        totalTokens={totalTokens} 
        language={language} 
        setLanguage={setLanguage} 
        isTrial={isTrial}
        onOpenSettings={() => setShowOnboarding(true)}
      />
      <ChatArea 
        messages={messages} 
        setMessages={setMessages} 
        setTotalTokens={setTotalTokens} 
        language={language} 
        apiKey={apiKey}
      />
    </div>
  );
};

export default ChatPage;
