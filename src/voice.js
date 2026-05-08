export class VoiceEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.recognition = null;
    this.voices = [];
    this.isSpeaking = false;

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
    this.voices = this.synth.getVoices();
  }

  speak(text, onStart, onEnd) {
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    const preferred = this.voices.find(v =>
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Moira') ||
      v.name.includes('Google UK English Female') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    ) || this.voices.find(v => v.lang.startsWith('en'));

    if (preferred) utterance.voice = preferred;

    utterance.onstart  = () => { this.isSpeaking = true;  onStart?.(); };
    utterance.onend    = () => { this.isSpeaking = false; onEnd?.(); };
    utterance.onerror  = () => { this.isSpeaking = false; onEnd?.(); };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    this.synth.cancel();
    this.isSpeaking = false;
  }

  listen(onResult, onError) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      onError?.('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    this.recognition = new SR();
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (e) => onError?.(e.error);
    this.recognition.start();
    return this.recognition;
  }

  stopListening() {
    this.recognition?.stop();
  }
}