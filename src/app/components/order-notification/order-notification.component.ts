
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderNotificationService, OrderNotification } from 'src/app/services/order-notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-order-notification',
  templateUrl: './order-notification.component.html',
  styleUrls: ['./order-notification.component.scss'],
  animations: [
    trigger('slideIn', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
      transition('* => void', animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)'))
    ])
  ]
})
export class OrderNotificationComponent implements OnInit, OnDestroy {
  notifications: OrderNotification[] = [];
  isPlaying = false;
  
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: OrderNotificationService) {
    console.log('🎨 OrderNotificationComponent constructor');
  }

  ngOnInit(): void {
    console.log('🎨 OrderNotificationComponent OnInit - Configurando suscripciones');
    
    // Suscribirse a nuevas notificaciones
    this.subscription.add(
      this.notificationService.notification$.subscribe({
        next: (notification) => {
          console.log('🔔 NOTIFICACIÓN RECIBIDA EN COMPONENTE:', notification);
          this.addNotification(notification);
        },
        error: (error) => {
          console.error('❌ Error en suscripción de notificaciones:', error);
        }
      })
    );

    // Suscribirse al estado de reproducción de voz
    this.subscription.add(
      this.notificationService.isPlaying$.subscribe({
        next: (isPlaying) => {
          console.log('🔊 Estado de reproducción:', isPlaying);
          this.isPlaying = isPlaying;
        },
        error: (error) => {
          console.error('❌ Error en suscripción de isPlaying:', error);
        }
      })
    );

    console.log('✅ Suscripciones configuradas correctamente');
  }

  ngOnDestroy(): void {
    console.log('🎨 OrderNotificationComponent OnDestroy - Limpiando suscripciones');
    this.subscription.unsubscribe();
  }

  addNotification(notification: OrderNotification): void {
    console.log('📥 Agregando notificación a la lista:', notification);
    console.log('📊 Notificaciones actuales antes de agregar:', this.notifications.length);
    
    // Agregar al inicio del array
    this.notifications.unshift(notification);
    
    console.log('📊 Notificaciones actuales después de agregar:', this.notifications.length);
    console.log('📋 Lista completa de notificaciones:', this.notifications);

    // Auto-eliminar después de 20 segundos (aumentado para mejor visibilidad)
    setTimeout(() => {
      console.log(`⏰ Auto-eliminando notificación #${notification.orderId}`);
      this.removeNotification(notification);
    }, 20000);
  }

  removeNotification(notification: OrderNotification): void {
    const index = this.notifications.indexOf(notification);
    console.log(`🗑️ Intentando eliminar notificación en índice ${index}`);
    
    if (index > -1) {
      this.notifications.splice(index, 1);
      console.log(`✅ Notificación eliminada. Quedan ${this.notifications.length} notificaciones`);
    } else {
      console.log('⚠️ Notificación no encontrada en el array');
    }
  }

  closeNotification(notification: OrderNotification): void {
    console.log(`❌ Usuario cerró notificación #${notification.orderId}`);
    this.removeNotification(notification);
  }

  stopSpeech(): void {
    console.log('🔇 Usuario solicitó detener la voz');
    this.notificationService.cancelSpeech();
  }
}