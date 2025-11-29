import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderNotificationService } from 'src/app/services/order-notification.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  constructor(
    private notificationService: OrderNotificationService
  ) {
    console.log('🏢 AdminLayoutComponent constructor');
  }

  async ngOnInit() {
    console.log('🏢 AdminLayoutComponent OnInit - Iniciando servicio de notificaciones');
    
    try {
      // Inicializar el servicio de notificaciones
      await this.notificationService.initialize();
      
      // Iniciar el monitoreo de nuevos pedidos
      await this.notificationService.startMonitoring();
      
      console.log('✅ Sistema de notificaciones iniciado correctamente');
    } catch (error) {
      console.error('❌ Error iniciando sistema de notificaciones:', error);
    }
  }

  ngOnDestroy() {
    console.log('🏢 AdminLayoutComponent OnDestroy - Deteniendo servicio');
    // Detener el monitoreo al destruir el componente
    this.notificationService.stopMonitoring();
  }
}