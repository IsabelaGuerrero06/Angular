import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  
  // ✅ ESTE es el modelo correcto que SÍ funciona
  private readonly API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly MODEL = 'gemini-2.5-flash';
  
  private systemPrompt = `Eres un asistente virtual para un sistema de delivery de comida llamado "DeliveryApp". 
Tu función es ayudar a los usuarios a navegar por el sistema y responder sus preguntas de manera concisa.

INFORMACIÓN DEL SISTEMA:
- El sistema gestiona pedidos de comida de restaurantes con entregas en motocicleta
- Secciones principales: Dashboard, Products, Menus, Restaurants, Orders, Customers, Drivers, Motorcycles, Shifts, Addresses, Issues, Photos

RUTAS PRINCIPALES:
- Registrar conductor: /drivers/create
- Ver conductores: /drivers/list
- Realizar pedido: /orders/create
- Ver pedidos: /orders/list
- Registrar restaurante: /restaurants/create

Responde de manera amigable, concisa y en español.`;

  constructor(private http: HttpClient) {
    console.log('🤖 GeminiService inicializado');
    console.log('📦 Modelo:', this.MODEL);
  }

  sendMessage(message: string): Observable<string> {
    if (!environment.gemini_api_key || environment.gemini_api_key.length < 20) {
      return of('⚠️ API Key no configurada correctamente');
    }

    this.chatHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // ✅ Estructura exacta que funciona en PowerShell
    const requestBody = {
      contents: [{
        parts: [{
          text: `${this.systemPrompt}\n\nUsuario: ${message}\n\nAsistente:`
        }]
      }]
    };

    const url = `${this.API_BASE}/models/${this.MODEL}:generateContent?key=${environment.gemini_api_key}`;

    console.log('📤 Enviando mensaje a Gemini...');
    console.log('🔗 Modelo:', this.MODEL);

    return this.http.post<any>(url, requestBody, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      timeout(30000),
      map(response => {
        console.log('✅ Respuesta exitosa:', response);
        
        if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.warn('⚠️ Respuesta sin texto:', response);
          throw new Error('Respuesta vacía de Gemini');
        }

        const text = response.candidates[0].content.parts[0].text;
        
        this.chatHistory.push({
          role: 'assistant',
          content: text,
          timestamp: new Date()
        });
        
        console.log('💬 Respuesta:', text);
        return text;
      }),
      catchError((error: any) => {
        console.error('❌ Error completo:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error body:', error.error);
        
        let errorMessage = 'Lo siento, ocurrió un error inesperado.';
        
        if (error.status === 429) {
          errorMessage = '⏱️ Demasiadas peticiones. Espera 1 minuto e intenta de nuevo.';
        } else if (error.status === 400) {
          errorMessage = '⚠️ Error en la petición. Verifica la configuración.';
        } else if (error.status === 403) {
          errorMessage = '🚫 API Key inválida o sin permisos.';
        } else if (error.status === 404) {
          errorMessage = '❌ Modelo no encontrado. Contacta al desarrollador.';
        } else if (error.status === 0) {
          errorMessage = '🔌 Error de red o CORS. Verifica tu conexión.';
        }
        
        this.chatHistory.push({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        });
        
        return of(errorMessage);
      })
    );
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearHistory() {
    this.chatHistory = [];
  }
}