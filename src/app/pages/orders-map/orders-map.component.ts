import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket-service.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders-map',
  templateUrl: './orders-map.component.html',
  styleUrls: ['./orders-map.component.scss']
})
export class OrdersMapComponent implements OnInit, OnDestroy {

  private map: any;
  private markers: { [key: string]: any } = {}; // Marcadores por placa
  motorcycles: any[] = [];
  selectedPlate: string = '';
  isTracking: boolean = false;

  // Icono personalizado para las motos
  motorcycleIcon = L.icon({
    iconUrl: 'assets/img/markers/motorcycle-marker.png',
    shadowUrl: 'assets/img/markers/marker-shadow.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -37],
    shadowSize: [41, 41]
  });

  // Icono por defecto de Leaflet (fallback)
  defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) { }

  ngAfterViewInit(): void {
    // Conectar el WebSocket cuando el componente esté listo
    setTimeout(() => {
      this.connectWebSocket();
    }, 100);
  }

  // Conectar al WebSocket
  connectWebSocket(): void {
    console.log('🔌 Intentando conectar al WebSocket...');
    this.webSocketService.connect();
  }

  ngOnInit(): void {
    this.initMap();
    this.loadMotorcycles();
  }

  ngOnDestroy(): void {
    // Detener tracking al salir del componente
    if (this.selectedPlate) {
      this.stopTracking();
    }
    // Desconectar WebSocket
    this.webSocketService.disconnect();
  }

  // Inicializar el mapa
  initMap(): void {
    // Coordenadas de Manizales, Colombia
    const defaultLat = 5.0689;
    const defaultLng = -75.5174;

    this.map = L.map('map').setView([defaultLat, defaultLng], 13);

    // Capa de mapa (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Ajustar tamaño del mapa después de que el DOM esté listo
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  // Cargar lista de motocicletas desde el backend
  loadMotorcycles(): void {
    this.http.get<any[]>(`${environment.url_backend}/motorcycles`).subscribe({
      next: (data) => {
        this.motorcycles = data;
        console.log('✅ Motorcycles loaded:', this.motorcycles);
      },
      error: (error) => {
        console.error('❌ Error loading motorcycles:', error);
        Swal.fire('Error', 'No se pudieron cargar las motocicletas', 'error');
      }
    });
  }

  // Iniciar tracking de una moto
  startTracking(): void {
    if (!this.selectedPlate) {
      Swal.fire('Atención', 'Selecciona una motocicleta', 'warning');
      return;
    }

    console.log('🚀 Iniciando tracking para:', this.selectedPlate);

    // Verificar si el WebSocket está conectado
    if (!this.webSocketService.isConnected()) {
      console.log('❌ WebSocket no conectado, reconectando...');
      this.webSocketService.reconnect();
      
      // Esperar a que se conecte
      setTimeout(() => {
        if (this.webSocketService.isConnected()) {
          this.iniciarTrackingReal();
        } else {
          Swal.fire('Error', 'No se pudo conectar al servidor en tiempo real. Verifica que el backend esté corriendo en http://127.0.0.1:5000', 'error');
        }
      }, 1000);
    } else {
      this.iniciarTrackingReal();
    }
  }

  // Método auxiliar para iniciar el tracking real
  private iniciarTrackingReal(): void {
    console.log('✅ WebSocket conectado, configurando tracking...');

    // Configurar el evento a escuchar (la placa)
    this.webSocketService.setNameEvent(this.selectedPlate);

    // Suscribirse al callback para recibir coordenadas
    this.webSocketService.callback.subscribe((coordinates) => {
      console.log(`📍 Coordenadas recibidas para ${this.selectedPlate}:`, coordinates);
      this.updateMarker(this.selectedPlate, coordinates);
    });

    // Iniciar tracking en el backend
    this.http.post(`${environment.url_backend}/motorcycles/track/${this.selectedPlate}`, {}).subscribe({
      next: (response: any) => {
        console.log('✅ Tracking started:', response);
        this.isTracking = true;

        Swal.fire({
          icon: 'success',
          title: 'Tracking iniciado',
          text: `Siguiendo motocicleta: ${this.selectedPlate}`,
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('❌ Error starting tracking:', error);
        Swal.fire('Error', 'No se pudo iniciar el tracking. Verifica que el backend esté corriendo.', 'error');
      }
    });
  }

  // Detener tracking
  stopTracking(): void {
    if (!this.selectedPlate) return;

    console.log('🛑 Deteniendo tracking para:', this.selectedPlate);

    this.http.post(`${environment.url_backend}/motorcycles/stop/${this.selectedPlate}`, {}).subscribe({
      next: (response: any) => {
        console.log('✅ Tracking stopped:', response);
        this.isTracking = false;

        // Detener escucha de WebSocket
        this.webSocketService.stopListening();

        // Remover marcador del mapa
        if (this.markers[this.selectedPlate]) {
          this.map.removeLayer(this.markers[this.selectedPlate]);
          delete this.markers[this.selectedPlate];
        }

        Swal.fire({
          icon: 'info',
          title: 'Tracking detenido',
          text: `Motocicleta: ${this.selectedPlate}`,
          timer: 2000,
          showConfirmButton: false
        });

        this.selectedPlate = '';
      },
      error: (error) => {
        console.error('❌ Error stopping tracking:', error);
      }
    });
  }

  // Actualizar o crear marcador en el mapa
  updateMarker(plate: string, coordinates: any): void {
    console.log('🗺️ Actualizando marcador para:', plate, coordinates);

    const lat = coordinates.lat || coordinates.latitude;
    const lng = coordinates.lng || coordinates.longitude;

    if (!lat || !lng) {
      console.error('❌ Coordenadas inválidas:', coordinates);
      return;
    }

    // Si el marcador ya existe, actualizar posición
    if (this.markers[plate]) {
      console.log('🔄 Actualizando posición del marcador existente');
      this.markers[plate].setLatLng([lat, lng]);
      this.markers[plate].setPopupContent(`
        <b>🏍️ Motocicleta: ${plate}</b><br>
        📍 Lat: ${lat.toFixed(6)}<br>
        📍 Lng: ${lng.toFixed(6)}<br>
        <small>⏱️ Actualizado: ${new Date().toLocaleTimeString()}</small>
      `);
    } else {
      // Crear nuevo marcador
      console.log('➕ Creando nuevo marcador');
      const marker = L.marker([lat, lng], { icon: this.defaultIcon })
        .addTo(this.map)
        .bindPopup(`
          <b>🏍️ Motocicleta: ${plate}</b><br>
          📍 Lat: ${lat.toFixed(6)}<br>
          📍 Lng: ${lng.toFixed(6)}<br>
          <small>⏱️ Actualizado: ${new Date().toLocaleTimeString()}</small>
        `)
        .openPopup();

      this.markers[plate] = marker;

      // Centrar mapa en el nuevo marcador
      this.map.setView([lat, lng], 15);
    }
  }
}