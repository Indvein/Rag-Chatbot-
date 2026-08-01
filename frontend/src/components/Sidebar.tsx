import React, { useRef, useState, useEffect } from 'react';
import { FileText, UploadCloud, Loader2, CheckCircle2, Database, Globe, X } from 'lucide-react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "./ui/attachment";
import type { Message } from '../types';
import { API_BASE_URL } from '../config';

interface SidebarProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  totalTokens: number;
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
  isTrial: boolean;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setMessages, totalTokens, language, setLanguage, isTrial, onOpenSettings }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [documents, setDocuments] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert("Only PDF files are supported right now!");
      return;
    }

    setUploadStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data = await response.json();
      setUploadStatus('success');
      
      if (data.total_chunks_created === 0) {
        alert("Warning: No readable text was found in this PDF. It might be scanned images.");
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've successfully read "${file.name}" and split it into ${data.total_chunks_created} chunks of knowledge. What would you like to know about it?`
      }]);
      
      fetchDocuments(); // Refresh the list
      
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error: any) {
      console.error(error);
      setUploadStatus('error');
      alert(`Upload failed: ${error.message}`);
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    // Optimistic UI update for instant feedback
    const previousDocs = [...documents];
    setDocuments(docs => docs.filter(d => d.id !== docId));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        setDocuments(previousDocs);
        const errData = await response.json().catch(() => ({}));
        alert(`Failed to delete document: ${errData.detail || 'Unknown server error'}`);
      }
    } catch (error) {
      setDocuments(previousDocs);
      alert("Error communicating with server.");
    }
  };

  return (
    <aside className="w-full md:w-80 bg-bg-panel border-b md:border-b-0 md:border-r border-border flex flex-col p-4 md:p-5 z-10 h-auto md:h-full max-h-[44vh] md:max-h-none shadow-[0_8px_30px_rgba(56,48,37,0.05)] md:shadow-[8px_0_30px_rgba(56,48,37,0.05)]">
      <div className="flex items-center gap-3 mb-5 md:mb-7">
        <div className="bg-accent-soft border border-border rounded-xl overflow-hidden flex items-center justify-center w-12 h-12">
          <img src="/chatbot.png" alt="Bot Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-main">Document Chat</h1>
          <p className="text-xs text-text-muted font-medium mt-0.5">Ask questions from your PDFs</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex-shrink-0">Documents</h2>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 group cursor-pointer flex flex-col items-center justify-center p-4 md:p-5 border border-dashed border-border rounded-xl hover:border-accent hover:bg-accent-soft transition-all duration-200 bg-bg-soft mb-4 md:mb-5"
        >
          {uploadStatus === 'uploading' ? (
            <Loader2 className="animate-spin text-accent mb-2" size={26} />
          ) : uploadStatus === 'success' ? (
            <CheckCircle2 className="text-accent mb-2" size={26} />
          ) : (
            <UploadCloud className="text-text-muted group-hover:text-accent transition-all duration-200 mb-2" size={26} />
          )}
          <p className="text-sm font-medium text-text-main text-center">
            {uploadStatus === 'uploading' ? 'Processing...' : uploadStatus === 'success' ? 'Document Ready' : 'Upload PDF Document'}
          </p>
          {uploadStatus === 'idle' && (
            <p className="text-xs text-text-muted mt-1.5 text-center">Click to browse your files</p>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf" 
            className="hidden" 
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 scroll-smooth">
          {documents.length === 0 ? (
            <div className="text-center py-8 px-3 rounded-xl border border-border bg-bg-main">
              <Database size={22} className="mx-auto text-text-muted/60 mb-2" />
              <p className="text-xs text-text-muted">No documents yet.</p>
            </div>
          ) : (
            <AttachmentGroup>
              {documents.map((doc) => (
                <Attachment key={doc.id}>
                  <AttachmentMedia>
                    <FileText size={20} />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{doc.filename}</AttachmentTitle>
                    <AttachmentDescription>{doc.chunk_count} chunks - PDF</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction aria-label="Remove Document" onClick={() => handleDelete(doc.id)}>
                      <X size={16} />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
        </div>
        
        {/* Language Selector */}
        <div className="mt-4 pt-4 md:pt-5 border-t border-border flex-shrink-0">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2 mb-3">
            <Globe size={14} /> Output Language
          </label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-bg-main border border-border rounded-lg p-2.5 text-sm font-medium text-text-main focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-colors cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Hinglish">Hinglish</option>
          </select>
        </div>
        
        {/* Token Usage Tracker */}
        <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {isTrial ? "Trial Usage" : "API Usage"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-main">
                {totalTokens.toLocaleString()} {isTrial ? "/ 5K" : ""}
              </span>
              <button onClick={onOpenSettings} className="text-[10px] bg-bg-soft hover:bg-border border border-border px-1.5 py-0.5 rounded transition-colors text-text-muted" title="Setup API Key">
                ⚙️ Setup
              </button>
            </div>
          </div>
          <div className="h-2 w-full bg-bg-main border border-border rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isTrial && totalTokens >= 5000 ? 'bg-red-500' : 'bg-accent'}`}
              style={{ width: `${Math.min((totalTokens / (isTrial ? 5000 : 50000)) * 100, 100)}%` }}
            />
          </div>
          {isTrial && totalTokens >= 5000 && (
            <p className="text-[10px] text-red-500 mt-1.5 font-medium">Trial limit reached. Please setup your API key.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


