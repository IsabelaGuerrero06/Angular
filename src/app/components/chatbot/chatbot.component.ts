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
  
  // 🎤 Nuevas propiedades para voz
  isSpeaking = false;
  voiceEnabled = true;
  speechSynthesis: SpeechSynthesis;
  currentUtterance: SpeechSynthesisUtterance | null = null;

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
    // Cargar voces disponibles (necesario en algunos navegadores)
    if (this.speechSynthesis.getVoices().length === 0) {
      this.speechSynthesis.addEventListener('voiceschanged', () => {
        this.logAvailableVoices();
      });
    } else {
      this.logAvailableVoices();
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
        this.speak(welcomeMessage);
      }
    }, 500);
  }

  // 📋 Método para ver voces disponibles en consola
  private logAvailableVoices() {
    const voices = this.speechSynthesis.getVoices();
    console.log('🎤 Voces disponibles:');
    voices.forEach((voice, index) => {
      console.log(`${index}: ${voice.name} (${voice.lang})`);
    });
  }

  ngOnDestroy() {
    // Detener voz al destruir componente
    this.stopSpeaking();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      setTimeout(() => this.scrollToBottom(), 100);
      
      // Reproducir bienvenida si es la primera vez
      if (this.messages.length === 1 && this.voiceEnabled) {
        this.speak(this.messages[0].content);
      }
    } else {
      // Detener voz al cerrar
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

    // Detener cualquier voz activa
    this.stopSpeaking();

    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    this.scrollToBottom();

    this.geminiService.sendMessage(message).subscribe({
      next: (responseText: string) => {
        this.messages.push({
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
        
        // 🎤 Reproducir respuesta con voz
        if (this.voiceEnabled) {
          this.speak(responseText);
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
          this.speak(errorMsg);
        }
      }
    });
  }

  // 🎤 FUNCIONES DE VOZ
  speak(text: string) {
    // Limpiar texto de emojis y caracteres especiales usando un método más compatible
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Símbolos & pictogramas
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transporte & símbolos de mapa
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Banderas
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Símbolos varios
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .trim();
    
    if (!cleanText || !this.voiceEnabled) return;

    // Cancelar cualquier voz anterior
    this.stopSpeaking();

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    
    // 👩 Configurar voz FEMENINA en español
    const voices = this.speechSynthesis.getVoices();
    
    // Buscar voz femenina en español (prioridad)
    const femaleSpanishVoice = voices.find(voice => 
      (voice.lang.startsWith('es') || voice.lang.startsWith('es-')) &&
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('mujer') ||
       voice.name.toLowerCase().includes('maria') ||
       voice.name.toLowerCase().includes('helena') ||
       voice.name.toLowerCase().includes('monica') ||
       voice.name.toLowerCase().includes('paulina') ||
       !voice.name.toLowerCase().includes('male'))
    );
    
    // Si no encuentra femenina específica, buscar cualquier voz en español
    const spanishVoice = femaleSpanishVoice || voices.find(voice => 
      voice.lang.startsWith('es')
    );
    
    if (spanishVoice) {
      this.currentUtterance.voice = spanishVoice;
      console.log('🎤 Voz seleccionada:', spanishVoice.name);
    }
    
    this.currentUtterance.lang = 'es-ES';
    this.currentUtterance.rate = 1.15;  // 🚀 Más rápida (1.0 = normal, 1.15 = 15% más rápida)
    this.currentUtterance.pitch = 1.2;  // 🎵 Tono más agudo/femenino (1.0 = normal)
    this.currentUtterance.volume = 1.0;

    // Eventos
    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🎤 Iniciando voz...');
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      console.log('🎤 Voz finalizada');
    };

    this.currentUtterance.onerror = (event) => {
      console.error('❌ Error en síntesis de voz:', event);
      this.isSpeaking = false;
    };

    // Reproducir
    this.speechSynthesis.speak(this.currentUtterance);
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