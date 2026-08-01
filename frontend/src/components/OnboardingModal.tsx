import React, { useState } from 'react';
import { KeyRound, Sparkles, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

interface OnboardingModalProps {
  onSaveKey: (key: string) => void;
  onStartTrial: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSaveKey, onStartTrial }) => {
  const [inputKey, setInputKey] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-panel border border-border shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden animate-slide-up-fade">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent-soft p-3 rounded-xl border border-border">
              <Sparkles className="text-accent" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main">Welcome to Workspace AI</h1>
              <p className="text-text-muted mt-1">Enterprise-grade document intelligence</p>
            </div>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="flex gap-4">
              <ShieldCheck className="text-accent shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-text-main">100% Transparent Citations</h3>
                <p className="text-sm text-text-muted mt-1">Every claim is backed by extracted source text you can verify with a simple hover.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap className="text-accent shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-text-main">Lightning Fast Llama 3.1</h3>
                <p className="text-sm text-text-muted mt-1">Powered by Groq's LPUs, delivering instant responses and deep document comprehension.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-bg-main border border-border rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
              <KeyRound size={18} className="text-text-muted" /> Bring Your Own Key
            </h3>
            <p className="text-xs text-text-muted mb-4">
              To use the Workspace, securely enter your Groq API key. It is stored locally in your browser and never sent to our database.
            </p>
            <div className="flex gap-3">
              <input 
                type="password"
                placeholder="gsk_..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="flex-1 bg-bg-panel border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-text-main focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <button 
                onClick={() => onSaveKey(inputKey)}
                disabled={!inputKey.trim()}
                className="bg-accent text-accent-text font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                Connect <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="text-center border-t border-border pt-6">
            <p className="text-sm text-text-muted mb-3">Just want to try it out?</p>
            <button 
              onClick={onStartTrial}
              className="text-text-main font-semibold hover:text-accent transition-colors underline underline-offset-4"
            >
              Start 5K Token Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
