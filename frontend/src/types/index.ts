export interface SourceInfo {
  name: string;
  text: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[] | string[];
}
