export default function handler(req, res) {
  const headers = {
    'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  };
  
  return {
    headers,
    url: 'https://api.openai.com/v1/chat/completions'
  };
} 