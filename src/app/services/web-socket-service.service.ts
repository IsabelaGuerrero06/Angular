import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService extends Socket {
  callback: EventEmitter<any> = new EventEmitter();
  nameEvent: string;

  constructor() {
    // Conectar al WebSocket del backend
    super({
      url: environment.url_backend, // http://127.0.0.1:5000
      options: {
        // Flask-SocketIO usa polling primero, luego upgrade a websocket
        transports: ['polling', 'websocket'], // 👈 CAMBIO IMPORTANTE
        autoConnect: true, // 👈 CAMBIO: Auto-conectar
        reconnection: true, // 👈 CAMBIO: Permitir reconexión
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      }
    });
    
    this.nameEvent = "";
    
    // Logs para debugging
    this.ioSocket.on('connect', () => {
      console.log('✅ WebSocket conectado al servidor');
      console.log('🔌 Transport:', this.ioSocket.io.engine.transport.name);
    });

    this.ioSocket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
      console.error('🔍 URL intentada:', environment.url_backend);
    });

    this.ioSocket.on('disconnect', (reason: string) => {
      console.log('🔌 WebSocket desconectado. Razón:', reason);
    });

    this.ioSocket.on('error', (error: any) => {
      console.error('❌ Error en WebSocket:', error);
    });

    // Detectar upgrade de polling a websocket
    this.ioSocket.io.engine.on('upgrade', (transport: any) => {
      console.log('⬆️ Upgraded to:', transport.name);
    });
  }

  /**
   * Conectar manualmente al WebSocket
   */
  connect() {
    if (!this.isConnected()) {
      console.log('🔌 Conectando al WebSocket...');
      this.ioSocket.connect();
    } else {
      console.log('✅ WebSocket ya está conectado');
    }
  }

  /**
   * Establecer el evento a escuchar (placa de la moto)
   * @param plateNumber - Placa de la motocicleta a trackear
   */
  setNameEvent(plateNumber: string) {
    // Si ya hay un evento anterior, dejar de escucharlo
    if (this.nameEvent) {
      this.ioSocket.off(this.nameEvent);
      console.log(`🔇 Dejando de escuchar: ${this.nameEvent}`);
    }

    // Establecer nuevo evento (la placa de la moto)
    this.nameEvent = plateNumber;
    console.log(`🎧 Escuchando evento: ${this.nameEvent}`);
    
    // Iniciar escucha
    this.listen();
  }

  /**
   * Escuchar eventos del WebSocket con la placa actual
   */
  listen = () => {
    this.ioSocket.on(this.nameEvent, (coordinates: any) => {
      console.log(`📍 Coordenadas recibidas para ${this.nameEvent}:`, coordinates);
      this.callback.emit(coordinates);
    });
  }

  /**
   * Dejar de escuchar el evento actual
   */
  stopListening() {
    if (this.nameEvent) {
      this.ioSocket.off(this.nameEvent);
      console.log(`🔇 Dejando de escuchar: ${this.nameEvent}`);
      this.nameEvent = "";
    }
  }

  /**
   * Verificar si el WebSocket está conectado
   */
  isConnected(): boolean {
    return this.ioSocket.connected;
  }

  /**
   * Reconectar manualmente si es necesario
   */
  reconnect() {
    if (!this.isConnected()) {
      console.log('🔄 Intentando reconectar...');
      this.ioSocket.connect();
    }
  }

  /**
   * Desconectar completamente
   */
  disconnect() {
    this.stopListening();
    this.ioSocket.disconnect();
    console.log('🔌 WebSocket desconectado manualmente');
  }
}