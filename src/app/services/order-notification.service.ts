// order-notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { OrderService } from './order.service';
import { DriverService } from './driver.service';
import { MotorcycleService } from './motorcycle.service';
import { ShiftService } from './shift.service';
import { Order } from '../models/Order';
import { Driver } from '../models/Driver';
import { Motorcycle } from '../models/Motorcycle';
import { Shift } from '../models/Shift';

export interface OrderNotification {
  orderId: number;
  driverName: string;
  motorcyclePlate: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrderNotificationService {
  private notificationSubject = new Subject<OrderNotification>();
  public notification$ = this.notificationSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();

  private audioContext: AudioContext | null = null;
  private alertBuffer: AudioBuffer | null = null;
  
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private notifiedOrderIds = new Set<number>();
  private pollingInterval: any = null;
  private readonly POLLING_INTERVAL_MS = 5000;

  private isMonitoring = false;
  private isInitialized = false;

  constructor(
    private orderService: OrderService,
    private driverService: DriverService,
    private motorcycleService: MotorcycleService,
    private shiftService: ShiftService
  ) {
    this.speechSynthesis = window.speechSynthesis;
    console.log('🔔 OrderNotificationService constructor iniciado');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Servicio ya inicializado');
      return;
    }

    try {
      await this.initializeAlertSound();
      this.isInitialized = true;
      console.log('✅ Servicio de notificaciones inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicio:', error);
    }
  }

  private async initializeAlertSound(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.3;
      this.alertBuffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = this.alertBuffer.getChannelData(0);

      for (let i = 0; i < this.alertBuffer.length; i++) {
        const t = i / sampleRate;
        const envelope = Math.sin(Math.PI * t / duration);
        data[i] = Math.sin(2 * Math.PI * 800 * t) * 0.3 * envelope;
      }

      console.log('✅ Sonido de alerta creado correctamente');
    } catch (error) {
      console.error('❌ Error creando sonido de alerta:', error);
    }
  }

  async startMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isMonitoring) {
      console.log('⚠️ El monitoreo ya está activo');
      return;
    }

    console.log('🚀 Iniciando monitoreo de nuevos pedidos...');
    this.isMonitoring = true;
    
    this.checkForNewOrders();

    this.pollingInterval = setInterval(() => {
      if (this.isMonitoring) {
        this.checkForNewOrders();
      }
    }, this.POLLING_INTERVAL_MS);

    console.log(`✅ Polling iniciado (cada ${this.POLLING_INTERVAL_MS}ms)`);
  }

  stopMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isMonitoring = false;
      console.log('🛑 Monitoreo de pedidos detenido');
    }
  }

  private checkForNewOrders(): void {
    console.log('🔍 Verificando nuevos pedidos...');
    
    this.orderService.list().subscribe({
      next: (orders: Order[]) => {
        console.log(`📦 Total de pedidos recibidos: ${orders.length}`);
        
        // 🔥 CAMBIO PRINCIPAL: Detectar pedidos con motorcycle_id asignado
        const newOrders = orders.filter(order => {
          const hasMotorcycle = !!(order as any).motorcycle_id;
          const notNotified = !this.notifiedOrderIds.has(order.id!);
          
          // Debug mejorado
          console.log(`📋 Pedido #${order.id}:`, {
            status: order.status,
            motorcycle_id: (order as any).motorcycle_id,
            hasMotorcycle,
            notNotified,
            willNotify: hasMotorcycle && notNotified
          });
          
          return hasMotorcycle && notNotified;
        });

        if (newOrders.length > 0) {
          console.log(`🆕 ${newOrders.length} nuevo(s) pedido(s) con conductor asignado`);
          newOrders.forEach(order => this.processNewOrder(order));
        } else {
          console.log('✓ No hay nuevos pedidos');
        }
      },
      error: (error) => {
        console.error('❌ Error al verificar pedidos:', error);
      }
    });
  }

  private processNewOrder(order: Order): void {
    console.log(`⚙️ Procesando pedido #${order.id}`);
    
    this.notifiedOrderIds.add(order.id!);

    this.getOrderInfo(order).then((orderInfo) => {
      console.log(`📋 Info del pedido #${order.id}:`, orderInfo);
      
      const notification: OrderNotification = {
        orderId: order.id!,
        driverName: orderInfo.driverName,
        motorcyclePlate: orderInfo.motorcyclePlate,
        timestamp: new Date()
      };

      this.notificationSubject.next(notification);
      console.log('📤 Notificación emitida:', notification);

      this.playAlert(notification);
    }).catch(error => {
      console.error('❌ Error al obtener detalles del pedido:', error);
      
      const notification: OrderNotification = {
        orderId: order.id!,
        driverName: 'Error al cargar',
        motorcyclePlate: 'Error al cargar',
        timestamp: new Date()
      };
      this.notificationSubject.next(notification);
      this.playAlert(notification);
    });
  }

  private getOrderInfo(order: Order): Promise<{driverName: string, motorcyclePlate: string}> {
    return new Promise((resolve, reject) => {
      try {
        const motorcycleId = (order as any).motorcycle_id;
        console.log(`🏍️ Motorcycle ID del pedido: ${motorcycleId}`);

        if (!motorcycleId) {
          resolve({ driverName: 'Sin asignar', motorcyclePlate: 'Sin asignar' });
          return;
        }

        this.getMotorcyclePlateById(motorcycleId).then(motorcyclePlate => {
          console.log(`🏍️ Placa obtenida: ${motorcyclePlate}`);
          
          this.shiftService.getActiveShifts().subscribe({
            next: (shifts: Shift[]) => {
              console.log(`👥 Shifts activos encontrados: ${shifts.length}`);
              
              const shiftWithMotorcycle = shifts.find(
                shift => shift.motorcycle_id === motorcycleId
              );

              if (!shiftWithMotorcycle) {
                console.log('⚠️ No se encontró shift para esta motocicleta');
                resolve({ 
                  driverName: 'Sin conductor asignado', 
                  motorcyclePlate 
                });
                return;
              }

              console.log(`✅ Shift encontrado con conductor ID: ${shiftWithMotorcycle.driver_id}`);

              this.getDriverNameById(shiftWithMotorcycle.driver_id).then(driverName => {
                console.log(`👤 Conductor obtenido: ${driverName}`);
                resolve({ driverName, motorcyclePlate });
              });
            },
            error: (error) => {
              console.error('❌ Error obteniendo shifts:', error);
              resolve({ 
                driverName: 'Error al obtener conductor', 
                motorcyclePlate 
              });
            }
          });
        }).catch(error => {
          console.error('❌ Error obteniendo placa:', error);
          reject(error);
        });
      } catch (error) {
        console.error('❌ Error en getOrderInfo:', error);
        reject(error);
      }
    });
  }

  private getDriverNameById(driverId: number | undefined): Promise<string> {
    if (!driverId) {
      return Promise.resolve('Sin asignar');
    }

    return new Promise((resolve) => {
      this.driverService.view(driverId).subscribe({
        next: (driver: Driver) => {
          resolve(driver.name || 'Conductor desconocido');
        },
        error: (error) => {
          console.error(`❌ Error obteniendo conductor ${driverId}:`, error);
          resolve('Conductor desconocido');
        }
      });
    });
  }

  private getMotorcyclePlateById(motorcycleId: number | undefined): Promise<string> {
    if (!motorcycleId) {
      return Promise.resolve('Sin asignar');
    }

    return new Promise((resolve) => {
      this.motorcycleService.view(motorcycleId).subscribe({
        next: (motorcycle: Motorcycle) => {
          resolve(motorcycle.license_plate || 'Placa desconocida');
        },
        error: (error) => {
          console.error(`❌ Error obteniendo motocicleta ${motorcycleId}:`, error);
          resolve('Placa desconocida');
        }
      });
    });
  }

  private playAlert(notification: OrderNotification): void {
    console.log('🔊 Reproduciendo alerta...');
    
    this.playBeeps(3);

    setTimeout(() => {
      this.speakNotification(notification);
    }, 500);
  }

  private playBeeps(count: number): void {
    if (!this.audioContext || !this.alertBuffer) {
      console.warn('⚠️ Audio no inicializado');
      return;
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        try {
          const source = this.audioContext!.createBufferSource();
          const gainNode = this.audioContext!.createGain();
          
          source.buffer = this.alertBuffer;
          source.connect(gainNode);
          gainNode.connect(this.audioContext!.destination);
          gainNode.gain.value = 0.5;
          
          source.start();
          console.log(`🔊 Beep ${i + 1}/${count} reproducido`);
        } catch (error) {
          console.error('❌ Error reproduciendo beep:', error);
        }
      }, i * 300);
    }
  }

  private speakNotification(notification: OrderNotification): void {
    this.cancelSpeech();

    const text = `Nuevo pedido asignado. Número ${notification.orderId}. 
                  Conductor: ${notification.driverName}. 
                  Motocicleta: ${notification.motorcyclePlate}.`;

    console.log('🗣️ Texto a pronunciar:', text);

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = 'es-ES';
    this.currentUtterance.rate = 0.9;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;

    this.currentUtterance.onstart = () => {
      this.isPlayingSubject.next(true);
      console.log('🔊 Iniciando síntesis de voz...');
    };

    this.currentUtterance.onend = () => {
      this.isPlayingSubject.next(false);
      console.log('✅ Síntesis de voz completada');
    };

    this.currentUtterance.onerror = (event) => {
      this.isPlayingSubject.next(false);
      console.error('❌ Error en síntesis de voz:', event);
    };

    try {
      this.speechSynthesis.speak(this.currentUtterance);
      console.log('✅ Síntesis de voz iniciada');
    } catch (error) {
      console.error('❌ Error al iniciar síntesis de voz:', error);
      this.isPlayingSubject.next(false);
    }
  }

  cancelSpeech(): void {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.isPlayingSubject.next(false);
      console.log('🔇 Síntesis de voz cancelada');
    }
  }

  clearNotifiedOrders(): void {
    this.notifiedOrderIds.clear();
    console.log('🗑️ Historial de notificaciones limpiado');
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  destroy(): void {
    this.stopMonitoring();
    this.cancelSpeech();
    this.notifiedOrderIds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('🗑️ Servicio destruido');
  }
}