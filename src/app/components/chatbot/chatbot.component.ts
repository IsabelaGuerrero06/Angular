import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeminiService, ChatMessage } from '../../services/gemini.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  isLoading = false;
  isMinimized = false;
  
  // 🎤 Propiedades para voz
  isSpeaking = false;
  voiceEnabled = true;
  speechSynthesis: SpeechSynthesis;
  currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // 🎯 Nueva: Voz femenina seleccionada
  selectedFemaleVoice: SpeechSynthesisVoice | null = null;

  quickQuestions = [
    '¿Para qué sirve este sistema?',
    '¿Dónde puedo registrar un conductor?',
    '¿Cómo realizo un pedido?',
    '¿Dónde veo los restaurantes?'
  ];

  constructor(
    private geminiService: GeminiService,
    private router: Router
  ) {
    this.speechSynthesis = window.speechSynthesis;
  }

  ngOnInit() {
    // Cargar y seleccionar la mejor voz femenina
    if (this.speechSynthesis.getVoices().length === 0) {
      this.speechSynthesis.addEventListener('voiceschanged', () => {
        this.selectBestFemaleVoice();
      });
    } else {
      this.selectBestFemaleVoice();
    }

    // Mensaje de bienvenida
    const welcomeMessage = '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?';
    this.messages.push({
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    });
    
    // Reproducir bienvenida al abrir
    setTimeout(() => {
      if (this.isOpen && this.voiceEnabled) {
        this.speakText(welcomeMessage);
      }
    }, 500);
  }

  // 🎯 NUEVO: Seleccionar "Google español" específicamente
  private selectBestFemaleVoice() {
    const voices = this.speechSynthesis.getVoices();
    console.log('🎤 Voces disponibles:', voices.length);
    
    // 🎯 Buscar específicamente "Google español"
    this.selectedFemaleVoice = voices.find(voice => 
      voice.name === 'Google español'
    );
    
    // Si no está disponible, buscar alternativas similares
    if (!this.selectedFemaleVoice) {
      this.selectedFemaleVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.lang.startsWith('es')
      ) || voices.find(voice => 
        voice.lang.startsWith('es')
      );
    }
    
    if (this.selectedFemaleVoice) {
      console.log('✅ Voz seleccionada:', this.selectedFemaleVoice.name);
    } else {
      console.warn('⚠️ "Google español" no disponible, usando voz por defecto');
    }
  }

  ngOnDestroy() {
    this.stopSpeaking();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => this.scrollToBottom(), 100);
      
      if (this.messages.length === 1 && this.voiceEnabled) {
        this.speakText(this.messages[0].content);
      }
    } else {
      this.stopSpeaking();
    }
  }

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
    if (this.isMinimized) {
      this.stopSpeaking();
    }
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const message = this.userMessage.trim();
    this.userMessage = '';
    this.isLoading = true;

    this.stopSpeaking();

    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    this.scrollToBottom();

    // 🚀 NUEVO: Variable para acumular la respuesta completa
    let fullResponse = '';
    let currentParagraph = '';

    this.geminiService.sendMessage(message).subscribe({
      next: (responseText: string) => {
        fullResponse = responseText;
        
        // Agregar mensaje completo al chat
        this.messages.push({
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        });
        
        this.isLoading = false;
        this.scrollToBottom();
        
        // 🎤 NUEVO: Hablar por párrafos para respuesta más rápida
        if (this.voiceEnabled) {
          this.speakInParagraphs(responseText);
        }
        
        this.detectRoute(responseText);
      },
      error: (error) => {
        console.error('Error al comunicarse con Gemini:', error);
        const errorMsg = 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.';
        
        this.messages.push({
          role: 'assistant',
          content: errorMsg,
          timestamp: new Date()
        });
        
        this.isLoading = false;
        this.scrollToBottom();
        
        if (this.voiceEnabled) {
          this.speakText(errorMsg);
        }
      }
    });
  }

  // 🎤 NUEVO: Hablar texto dividido en párrafos (más natural y rápido)
  private speakInParagraphs(text: string) {
    // Dividir en párrafos (por saltos de línea o puntos seguidos)
    const paragraphs = text
      .split(/\n+|(?<=\.)\s+(?=[A-ZÁÉÍÓÚÑ])/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    console.log(`📝 Dividido en ${paragraphs.length} párrafos`);
    
    // Hablar cada párrafo secuencialmente
    this.speakParagraphsSequentially(paragraphs, 0);
  }

  // 🎤 NUEVO: Hablar párrafos uno tras otro
  private speakParagraphsSequentially(paragraphs: string[], index: number) {
    if (index >= paragraphs.length || !this.voiceEnabled) {
      this.isSpeaking = false;
      return;
    }

    const paragraph = paragraphs[index];
    const cleanText = this.cleanTextForSpeech(paragraph);
    
    if (!cleanText) {
      this.speakParagraphsSequentially(paragraphs, index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // 👩 Aplicar voz femenina seleccionada
    if (this.selectedFemaleVoice) {
      utterance.voice = this.selectedFemaleVoice;
    }
    
    utterance.lang = 'es-ES';
    utterance.rate = 1.2;   // 🚀 Velocidad configurada
    utterance.pitch = 1.3;  // 🎵 Tono configurado
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log(`🎤 Hablando párrafo ${index + 1}/${paragraphs.length}`);
    };

    utterance.onend = () => {
      // Continuar con el siguiente párrafo
      setTimeout(() => {
        this.speakParagraphsSequentially(paragraphs, index + 1);
      }, 200); // Pequeña pausa entre párrafos
    };

    utterance.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      this.isSpeaking = false;
    };

    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  // 🎤 Método simple para hablar texto completo (usado en bienvenida y errores)
  private speakText(text: string) {
    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText || !this.voiceEnabled) return;

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // 👩 Aplicar voz femenina seleccionada
    if (this.selectedFemaleVoice) {
      utterance.voice = this.selectedFemaleVoice;
    }
    
    utterance.lang = 'es-ES';
    utterance.rate = 1.2;   // 🚀 Velocidad configurada
    utterance.pitch = 1.3;  // 🎵 Tono configurado
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🎤 Iniciando voz...');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('🎤 Voz finalizada');
    };

    utterance.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      this.isSpeaking = false;
    };

    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
  }

  // 🧹 NUEVO: Limpiar texto para síntesis de voz
  private cleanTextForSpeech(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos & pictogramas
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Banderas
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Símbolos varios
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[*_~`]/g, '')                 // Markdown
      .trim();
  }

  stopSpeaking() {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (!this.voiceEnabled) {
      this.stopSpeaking();
    }
  }

  sendQuickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  clearChat() {
    this.stopSpeaking();
    this.geminiService.clearHistory();
    this.messages = [{
      role: 'assistant',
      content: '¡Conversación reiniciada! ¿En qué puedo ayudarte?',
      timestamp: new Date()
    }];
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  private detectRoute(response: string) {
    const routeMatch = response.match(/\/([\w-]+)\/([\w-]+)/);
    if (routeMatch) {
      const route = routeMatch[0];
      console.log('Ruta detectada:', route);
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}