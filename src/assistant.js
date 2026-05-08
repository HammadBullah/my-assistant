// assistant.js
const API_KEY = "AIzaSyBQFB6x_1ir0aM0MQfCNQ2xBOYaHVGXI0U"; // aistudio.google.com
const history = [];

export async function chat(userMsg) {
  history.push({ role: "user", parts: [{ text: userMsg }] });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyBQFB6x_1ir0aM0MQfCNQ2xBOYaHVGXI0U}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history })
    }
  );

  const data = await res.json();
  const reply = data.candidates[0].content.parts[0].text;
  history.push({ role: "model", parts: [{ text: reply }] });
  return reply;
}