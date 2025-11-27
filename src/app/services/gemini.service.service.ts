import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private chatHistory: ChatMessage[] = [];
  
  // ✅ URL CORRECTA Y VERIFICADA - v1beta con gemini-pro
  private readonly API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly MODEL = 'gemini-pro';
  
  private systemPrompt = `Eres un asistente virtual para un sistema de delivery de comida llamado "DeliveryApp". 
Tu función es ayudar a los usuarios a navegar por el sistema y responder sus preguntas.

INFORMACIÓN DEL SISTEMA:
- El sistema gestiona pedidos de comida de restaurantes con entregas en motocicleta
- Tiene las siguientes secciones principales:
  * Dashboard: Vista general del sistema
  * Products: Gestión de productos/platillos
  * Menus: Gestión de menús de restaurantes
  * Restaurants: Gestión de restaurantes registrados
  * Orders: Gestión de pedidos
  * Customers: Gestión de clientes
  * Drivers: Gestión de conductores/repartidores
  * Motorcycles: Gestión de motocicletas
  * Shifts: Gestión de turnos de conductores
  * Addresses: Gestión de direcciones de entrega
  * Issues: Reporte de problemas con motocicletas
  * Photos: Fotos de evidencia de problemas

RUTAS PRINCIPALES:
- Registrar nuevo conductor: /drivers/create
- Ver todos los conductores: /drivers/list
- Realizar un pedido: /orders/create
- Ver todos los pedidos: /orders/list
- Registrar restaurante: /restaurants/create
- Ver restaurantes: /restaurants/list
- Registrar producto: /products/create
- Asignar turno a conductor: /shifts/create

INSTRUCCIONES:
- Responde de manera amigable y concisa
- Si te preguntan por una funcionalidad, explica qué hace y menciona la ruta
- Si no sabes algo, sé honesto
- Usa emojis ocasionalmente para ser más amigable
- Responde en español`;

  constructor(private http: HttpClient) {
    console.log('🤖 GeminiService inicializado');
    console.log('🔗 Modelo:', this.MODEL);
    console.log('🌐 API Base:', this.API_BASE);
  }

  /**
   * Envía un mensaje al chatbot y obtiene una respuesta
   */
  sendMessage(message: string): Observable<string> {
    // Validar que haya API key
    if (!this.isConfigured()) {
      console.error('❌ API Key no configurada');
      return of('⚠️ El chatbot no está configurado. Agrega tu API Key en environment.ts');
    }

    // Agregar mensaje del usuario al historial
    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    const fullPrompt = `${this.systemPrompt}

Usuario: ${message}

Asistente:`;

    // ✅ Estructura correcta para Gemini API v1beta
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Construir URL completa
    const url = `${this.API_BASE}/models/${this.MODEL}:generateContent?key=${environment.gemini_api_key}`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('📤 Enviando mensaje a Gemini...');
    console.log('🔗 Endpoint:', `${this.API_BASE}/models/${this.MODEL}:generateContent`);

    return this.http.post<any>(url, requestBody, { headers }).pipe(
      timeout(30000), // Timeout de 30 segundos
      map(response => {
        console.log('✅ Respuesta recibida de Gemini');

        // Validar estructura de respuesta
        if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.error('❌ Estructura de respuesta inválida:', response);
          throw new Error('Respuesta inválida de Gemini API');
        }

        const text = response.candidates[0].content.parts[0].text;
        
        // Agregar respuesta al historial
        this.chatHistory.push({
          role: 'assistant',
          content: text,
          timestamp: new Date()
        });
        
        console.log('💬 Respuesta procesada exitosamente');
        return text;
      }),
      catchError((error: any) => {
        console.error('❌ Error en Gemini API:', error);
        
        let errorMessage = 'Lo siento, ocurrió un error. Por favor intenta de nuevo.';
        
        // Detectar timeout
        if (error.name === 'TimeoutError') {
          errorMessage = '⏱️ Tiempo de espera agotado. Intenta de nuevo.';
        } else if (error.status === 0) {
          errorMessage = '🔌 Error de conexión. Verifica tu internet y que no haya CORS.';
          console.error('💡 Posible bloqueo de CORS o red');
        } else if (error.status === 400) {
          const apiError = error.error?.error;
          console.error('📋 Error 400 detalles:', apiError);
          
          if (apiError?.message?.includes('API key')) {
            errorMessage = '🔑 Error con la API Key. Puede que esté expirada o sea inválida.\n\n' +
                          '👉 Genera una nueva en: https://aistudio.google.com/app/apikey\n' +
                          '⏰ Espera 2-3 minutos después de crearla';
          } else {
            errorMessage = `⚠️ Error 400: ${apiError?.message || 'Solicitud inválida'}`;
          }
        } else if (error.status === 403) {
          errorMessage = '🚫 Acceso denegado. Verifica que:\n' +
                        '1. La API Key sea válida\n' +
                        '2. El proyecto tenga la API de Gemini habilitada\n\n' +
                        '👉 https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com';
        } else if (error.status === 404) {
          errorMessage = '🔍 Error 404: No se encontró el modelo.\n\n' +
                        'Esto puede ocurrir si:\n' +
                        '1. La API Key es muy nueva (espera 3-5 minutos)\n' +
                        '2. La API Key es inválida\n' +
                        '3. El modelo no está disponible en tu región\n\n' +
                        '👉 Verifica tu API Key en: https://aistudio.google.com/app/apikey';
          console.error('💡 Si la key es nueva, espera 5 minutos y recarga la página');
        } else if (error.status === 429) {
          errorMessage = '⏱️ Límite de solicitudes alcanzado. Espera un momento e intenta de nuevo.';
        } else if (error.status === 500 || error.status === 503) {
          errorMessage = '🔧 Error del servidor de Gemini. Intenta de nuevo en unos minutos.';
        }
        
        // Agregar al historial
        this.chatHistory.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        });
        
        return of(errorMessage);
      })
    );
  }

  /**
   * Obtiene el historial del chat
   */
  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.chatHistory = [];
  }

  /**
   * Verifica si la API Key está configurada
   */
  isConfigured(): boolean {
    return !!environment.gemini_api_key && 
           environment.gemini_api_key !== '' && 
           environment.gemini_api_key.length > 20;
  }

  /**
   * Obtiene información de configuración (para debugging)
   */
  getDebugInfo(): any {
    return {
      configured: this.isConfigured(),
      apiKeyLength: environment.gemini_api_key?.length || 0,
      model: this.MODEL,
      endpoint: `${this.API_BASE}/models/${this.MODEL}:generateContent`,
      historyLength: this.chatHistory.length
    };
  }
}