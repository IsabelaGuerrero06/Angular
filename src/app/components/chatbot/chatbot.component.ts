import { Component, OnInit } from '@angular/core';
import { GeminiService, ChatMessage } from '../../services/gemini.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  isLoading = false;
  isMinimized = false;

  // Sugerencias de preguntas frecuentes
  quickQuestions = [
    '¿Para qué sirve este sistema?',
    '¿Dónde puedo registrar un conductor?',
    '¿Cómo realizo un pedido?',
    '¿Dónde veo los restaurantes?'
  ];

  constructor(
    private geminiService: GeminiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Mensaje de bienvenida
    this.messages.push({
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      // Scroll al final cuando se abre
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  minimizeChat() {
    this.isMinimized = !this.isMinimized;
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const message = this.userMessage.trim();
    this.userMessage = '';
    this.isLoading = true;

    // Agregar mensaje del usuario
    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    this.scrollToBottom();

    // Enviar a Gemini - AQUÍ ESTÁ EL CAMBIO
    this.geminiService.sendMessage(message).subscribe({
      next: (responseText: string) => {  // Especificar tipo explícitamente
        // Agregar la respuesta del asistente
        this.messages.push({
          role: 'assistant',
          content: responseText,  // Ya es un string
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
        
        // Detectar si la respuesta menciona una ruta
        this.detectRoute(responseText);
      },
      error: (error) => {
        console.error('Error al comunicarse con Gemini:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  sendQuickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  clearChat() {
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
    // Detectar si la respuesta menciona una ruta
    const routeMatch = response.match(/\/([\w-]+)\/([\w-]+)/);
    if (routeMatch) {
      const route = routeMatch[0];
      console.log('Ruta detectada:', route);
      // Aquí podrías agregar un botón para navegar directamente
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}