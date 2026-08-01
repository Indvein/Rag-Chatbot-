import os
import litellm
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")

# Fallback chains per provider: try first model, if it fails (404/not found), try the next
PROVIDER_MODEL_CHAINS = {
    'groq': ['groq/llama-3.1-8b-instant', 'groq/llama3-8b-8192', 'groq/mixtral-8x7b-32768'],
    'openai': ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo'],
    'anthropic': ['anthropic/claude-3-haiku-20240307', 'anthropic/claude-3-5-haiku-latest'],
    'gemini': ['gemini/gemini-2.5-flash', 'gemini/gemini-2.5-flash-lite', 'gemini/gemini-2.0-flash', 'gemini/gemini-2.0-flash-lite'],
}

DEFAULT_CHAIN = ['groq/llama-3.1-8b-instant']

class LLMService:
    def __init__(self):
        self.default_api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")

    def generate_answer(self, query: str, context: str, history: List[Dict[str, str]] = None, language: str = "English", api_key: str = None, ai_provider: str = None) -> Dict:
        """
        Generates an answer using the provided context and conversation history.
        Dynamically selects the best available model with automatic fallback.
        """
        is_trial = not api_key
        client_key = api_key if api_key else self.default_api_key
        if not client_key:
            return {"answer": "No API Key provided or configured on the server.", "tokens_used": 0}
            
        # Get the fallback chain for this provider (or default to Groq for trial)
        if is_trial:
            model_chain = DEFAULT_CHAIN
        else:
            model_chain = PROVIDER_MODEL_CHAINS.get(ai_provider, DEFAULT_CHAIN)
        
        if history is None:
            history = []
            
        system_prompt = f"""
You are an expert AI assistant analyzing uploaded documents. 
The following context contains extracted parts of the user's PDF document(s). 
Answer the user's question using this context. 
If they ask for a summary of the document, provide a broad, intelligent summary using the provided context chunks.
If the context doesn't contain the answer to a specific factual question, politely say that you don't have that information.

CRITICAL INSTRUCTION: You MUST translate and provide your final answer completely in {language}. 
If the requested language is 'Hinglish', write the answer using casual Hindi vocabulary but written entirely in the English alphabet (e.g., "Yeh document policy ke baare mein batata hai...").
If the requested language is 'Hindi', write the answer entirely in the Devanagari script.

Context:
{context}
"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (up to last 5 messages to save context window)
        for msg in history[-5:]:
            # Map frontend roles to API roles
            role = "assistant" if msg.get("role") == "assistant" else "user"
            messages.append({"role": role, "content": msg.get("content")})
            
        # Add the current question
        messages.append({"role": "user", "content": query})

        # Try each model in the fallback chain
        last_error = None
        for model_str in model_chain:
            try:
                response = litellm.completion(
                    model=model_str,
                    messages=messages,
                    api_key=client_key,
                    max_tokens=512,
                )
                return {
                    "answer": response.choices[0].message.content,
                    "tokens_used": response.usage.total_tokens if response.usage else 0
                }
            except (litellm.NotFoundError, litellm.BadRequestError, litellm.RateLimitError) as e:
                # Model not available or rate limited, try the next one in the chain
                last_error = e
                continue
            except Exception as e:
                # Any other error (auth, rate limit, etc) — don't retry, just report
                return {
                    "answer": f"Error communicating with AI: {str(e)}",
                    "tokens_used": 0
                }
        
        # All models in the chain failed
        return {
            "answer": f"Error: Could not find a working model for provider '{ai_provider}'. Last error: {str(last_error)}",
            "tokens_used": 0
        }

llm_service = LLMService()
