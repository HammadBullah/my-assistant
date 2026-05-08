// voice.js

// Listen (speech → text)
export function startListening(onResult) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = e => onResult(e.results[0][0].transcript);
  recognition.start();
}

// Speak (text → speech)
export function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  speechSynthesis.speak(utterance);
}