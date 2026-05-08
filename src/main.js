import { ParticleField } from './particles.js';
import { VoiceEngine }   from './voice.js';
import { Assistant }     from './assistant.js';

// ── Init ──
const particles = new ParticleField('particles');
const voice     = new VoiceEngine();
const assistant = new Assistant('ARIA');

// ── DOM ──
const orb         = document.getElementById('orb');
const statusLabel = document.getElementById('statusLabel');
const chatArea    = document.getElementById('chatArea');
const textInput   = document.getElementById('textInput');
const sendBtn     = document.getElementById('sendBtn');
const micBtn      = document.getElementById('micBtn');
const voiceBars   = document.getElementById('voiceBars');
const nameInput   = document.getElementById('assistantName');

let appState = 'idle'; // idle | listening | thinking | speaking

// ── State machine ──
function setState(state) {
  appState = state;
  particles.setState(state);

  orb.className = 'orb';
  statusLabel.className = 'status-label';
  voiceBars.className = 'voice-bars';
  micBtn.classList.remove('active');

  switch (state) {
    case 'listening':
      orb.classList.add('listening');
      statusLabel.classList.add('listening');
      statusLabel.textContent = 'Listening...';
      voiceBars.classList.add('active');
      micBtn.classList.add('active');
      break;
    case 'thinking':
      orb.classList.add('thinking');
      statusLabel.classList.add('thinking');
      statusLabel.textContent = 'Thinking...';
      break;
    case 'speaking':
      orb.classList.add('speaking');
      statusLabel.classList.add('speaking');
      statusLabel.textContent = 'Speaking...';
      break;
    default:
      statusLabel.textContent = 'Online · Ready';
      break;
  }
}

// ── Chat UI ──
function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ── Send message flow ──
async function handleSend(userText) {
  if (!userText.trim() || appState === 'thinking') return;

  voice.stopSpeaking();
  addMessage('user', userText);
  setState('thinking');

  try {
    const reply = await assistant.send(userText);
    addMessage('assistant', reply);
    setState('speaking');
    voice.speak(
      reply,
      () => setState('speaking'),
      () => setState('idle')
    );
  } catch (err) {
    addMessage('assistant', `Error: ${err.message}. Check your API key in assistant.js`);
    setState('idle');
  }
}

// ── Mic button ──
micBtn.addEventListener('click', () => {
  if (appState === 'listening') {
    voice.stopListening();
    setState('idle');
    return;
  }
  if (appState === 'speaking') {
    voice.stopSpeaking();
    setState('idle');
    return;
  }

  setState('listening');
  voice.listen(
    (transcript) => {
      textInput.value = transcript;
      setState('idle');
      handleSend(transcript);
      textInput.value = '';
    },
    (err) => {
      addMessage('assistant', `Mic error: ${err}. Make sure you're using Chrome or Edge.`);
      setState('idle');
    }
  );
});

// ── Orb click ──
orb.addEventListener('click', () => {
  if (appState === 'idle')      micBtn.click();
  else if (appState === 'speaking') { voice.stopSpeaking(); setState('idle'); }
  else if (appState === 'listening') micBtn.click();
});

// ── Send button + Enter ──
sendBtn.addEventListener('click', () => {
  const msg = textInput.value.trim();
  if (msg) { handleSend(msg); textInput.value = ''; }
});

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const msg = textInput.value.trim();
    if (msg) { handleSend(msg); textInput.value = ''; }
  }
});

// ── Name change ──
nameInput.addEventListener('change', () => {
  const newName = nameInput.value.trim();
  if (newName) assistant.setName(newName);
});

// ── Greeting on load ──
window.addEventListener('load', () => {
  const name = nameInput.value.replace(/\s/g, '') || 'ARIA';
  const greeting = `Hello. I'm ${name}, your personal assistant. Click the orb or the mic to talk, or type below.`;
  addMessage('assistant', greeting);
  setTimeout(() => {
    setState('speaking');
    voice.speak(greeting, null, () => setState('idle'));
  }, 600);
});