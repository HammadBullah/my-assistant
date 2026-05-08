// assistant.js
const API_KEY = "AIzaSyBQFB6x_1ir0aM0MQfCNQ2xBOYaHVGXI0U"; // aistudio.google.com
// !! PASTE YOUR GEMINI API KEY BELOW !!
// Get it free at: https://aistudio.google.com
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyBQFB6x_1ir0aM0MQfCNQ2xBOYaHVGXI0U}`;

export class Assistant {
  constructor(name = 'ARIA') {
    this.name = name;
    this.history = [];
    this.systemPrompt = `You are ${this.name}, a highly capable personal AI assistant. 
You are conversational, warm, witty and direct. 
Keep responses concise — 2 to 4 sentences unless more depth is genuinely needed.
You have a slight personality — confident and helpful, never robotic.
You can help with tasks, writing, analysis, planning, ideas, coding, and anything else.`;
  }

  setName(name) {
    this.name = name;
    this.systemPrompt = this.systemPrompt.replace(/You are \w+,/, `You are ${name},`);
  }

  async send(userMessage) {
    this.history.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const body = {
      system_instruction: {
        parts: [{ text: this.systemPrompt }]
      },
      contents: this.history
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Sorry, I had trouble with that. Try again.';

    this.history.push({
      role: 'model',
      parts: [{ text: reply }]
    });

    // Keep history from growing too large (last 20 turns)
    if (this.history.length > 40) {
      this.history = this.history.slice(-40);
    }

    return reply;
  }

  clearHistory() {
    this.history = [];
  }
}