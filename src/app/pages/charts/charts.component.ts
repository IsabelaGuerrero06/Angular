import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Chart from 'chart.js';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

  // Estados de carga
  pieChartsLoaded = false;
  barChartsLoaded = false;
  lineChartsLoaded = false;

  // Errores
  pieChartsError: string | null = null;
  barChartsError: string | null = null;
  lineChartsError: string | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Verificar que url_mock_charts esté configurada
    if (!environment.url_mock_charts) {
      console.error('❌ url_mock_charts no está configurada en environment');
      this.pieChartsError = 'URL del mock server no configurada';
      this.barChartsError = 'URL del mock server no configurada';
      this.lineChartsError = 'URL del mock server no configurada';
      return;
    }

    console.log('🔄 Cargando datos desde:', environment.url_mock_charts);
    this.loadChartsData();
  }

  loadChartsData() {
    // Cargar datos de Pie Charts desde mock server
    this.http.get<any>(`${environment.url_mock_charts}/charts/pie-data`).subscribe({
      next: (data) => {
        console.log('✅ Pie Charts data cargada desde mock:', data);
        this.pieChartsLoaded = true;
        // Esperar a que Angular renderice los canvas
        this.cdr.detectChanges();
        setTimeout(() => this.createPieCharts(data), 0);
      },
      error: (error) => {
        console.error('❌ Error cargando pie charts:', error);
        this.pieChartsError = `Error: ${error.status || 'Sin conexión'} - ${error.message}`;
        // NO crear gráficos si falla - mostrar error en su lugar
      }
    });

    // Cargar datos de Bar Charts
    this.http.get<any>(`${environment.url_mock_charts}/charts/bar-data`).subscribe({
      next: (data) => {
        console.log('✅ Bar Charts data cargada desde mock:', data);
        this.barChartsLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => this.createBarCharts(data), 0);
      },
      error: (error) => {
        console.error('❌ Error cargando bar charts:', error);
        this.barChartsError = `Error: ${error.status || 'Sin conexión'} - ${error.message}`;
      }
    });

    // Cargar datos de Line Charts
    this.http.get<any>(`${environment.url_mock_charts}/charts/line-data`).subscribe({
      next: (data) => {
        console.log('✅ Line Charts data cargada desde mock:', data);
        this.lineChartsLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => this.createLineCharts(data), 0);
      },
      error: (error) => {
        console.error('❌ Error cargando line charts:', error);
        this.lineChartsError = `Error: ${error.status || 'Sin conexión'} - ${error.message}`;
      }
    });
  }

  // ========== PIE CHARTS ==========
  createPieCharts(data: any) {
    // Validar que los datos existan
    if (!data || !data.ordersStatus || !data.topProducts || !data.restaurantSales) {
      console.error('❌ Datos de pie charts incompletos:', data);
      this.pieChartsError = 'Datos incompletos recibidos del servidor';
      return;
    }

    console.log('🎨 Creando pie charts...');

    const ordersStatus = data.ordersStatus;
    const topProducts = data.topProducts;
    const restaurantSales = data.restaurantSales;

    // Pie Chart 1
    const pieChart1 = document.getElementById('pieChart1') as HTMLCanvasElement;
    if (pieChart1) {
      console.log('✅ Canvas pieChart1 encontrado');
      new Chart(pieChart1, {
        type: 'pie',
        data: {
          labels: ordersStatus.labels,
          datasets: [{
            data: ordersStatus.data,
            backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Distribución de Pedidos por Estado'
          }
        }
      });
    } else {
      console.error('❌ Canvas pieChart1 NO encontrado en el DOM');
    }

    // Pie Chart 2
    const pieChart2 = document.getElementById('pieChart2') as HTMLCanvasElement;
    if (pieChart2) {
      console.log('✅ Canvas pieChart2 encontrado');
      new Chart(pieChart2, {
        type: 'pie',
        data: {
          labels: topProducts.labels,
          datasets: [{
            data: topProducts.data,
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Productos Más Vendidos'
          }
        }
      });
    } else {
      console.error('❌ Canvas pieChart2 NO encontrado en el DOM');
    }

    // Pie Chart 3 (Doughnut)
    const pieChart3 = document.getElementById('pieChart3') as HTMLCanvasElement;
    if (pieChart3) {
      console.log('✅ Canvas pieChart3 encontrado');
      new Chart(pieChart3, {
        type: 'doughnut',
        data: {
          labels: restaurantSales.labels,
          datasets: [{
            data: restaurantSales.data,
            backgroundColor: ['#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Ventas por Restaurante'
          }
        }
      });
    } else {
      console.error('❌ Canvas pieChart3 NO encontrado en el DOM');
    }
  }

  // ========== BAR CHARTS ==========
  createBarCharts(data: any) {
    if (!data || !data.ordersByDay || !data.monthlyRevenue || !data.driversByShift) {
      console.error('❌ Datos de bar charts incompletos:', data);
      this.barChartsError = 'Datos incompletos recibidos del servidor';
      return;
    }

    console.log('🎨 Creando bar charts...');

    const ordersByDay = data.ordersByDay;
    const monthlyRevenue = data.monthlyRevenue;
    const driversByShift = data.driversByShift;

    // Bar Chart 1
    const barChart1 = document.getElementById('barChart1') as HTMLCanvasElement;
    if (barChart1) {
      console.log('✅ Canvas barChart1 encontrado');
      new Chart(barChart1, {
        type: 'bar',
        data: {
          labels: ordersByDay.labels,
          datasets: [{
            label: 'Pedidos',
            data: ordersByDay.data,
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Pedidos por Día de la Semana'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }

    // Bar Chart 2
    const barChart2 = document.getElementById('barChart2') as HTMLCanvasElement;
    if (barChart2) {
      new Chart(barChart2, {
        type: 'bar',
        data: {
          labels: monthlyRevenue.labels,
          datasets: [{
            label: 'Ingresos ($)',
            data: monthlyRevenue.data,
            backgroundColor: '#2ecc71',
            borderColor: '#27ae60',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Ingresos Mensuales'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }

    // Bar Chart 3
    const barChart3 = document.getElementById('barChart3') as HTMLCanvasElement;
    if (barChart3) {
      new Chart(barChart3, {
        type: 'bar',
        data: {
          labels: driversByShift.labels,
          datasets: [{
            label: 'Conductores',
            data: driversByShift.data,
            backgroundColor: '#9b59b6',
            borderColor: '#8e44ad',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Conductores Activos por Turno'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  }

  // ========== LINE CHARTS ==========
  createLineCharts(data: any) {
    if (!data || !data.dailyOrders || !data.yearlyComparison || !data.deliveryTime) {
      console.error('❌ Datos de line charts incompletos:', data);
      this.lineChartsError = 'Datos incompletos recibidos del servidor';
      return;
    }

    console.log('🎨 Creando line charts...');

    const dailyOrders = data.dailyOrders;
    const yearlyComparison = data.yearlyComparison;
    const deliveryTime = data.deliveryTime;

    // Line Chart 1
    const lineChart1 = document.getElementById('lineChart1') as HTMLCanvasElement;
    if (lineChart1) {
      console.log('✅ Canvas lineChart1 encontrado');
      new Chart(lineChart1, {
        type: 'line',
        data: {
          labels: dailyOrders.labels,
          datasets: [{
            label: 'Pedidos Diarios',
            data: dailyOrders.data,
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderColor: '#3498db',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Evolución de Pedidos en el Mes'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }

    // Line Chart 2
    const lineChart2 = document.getElementById('lineChart2') as HTMLCanvasElement;
    if (lineChart2) {
      new Chart(lineChart2, {
        type: 'line',
        data: {
          labels: yearlyComparison.labels,
          datasets: [
            {
              label: yearlyComparison.datasets[0].label,
              data: yearlyComparison.datasets[0].data,
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.2)',
              borderWidth: 2
            },
            {
              label: yearlyComparison.datasets[1].label,
              data: yearlyComparison.datasets[1].data,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Comparativa Anual de Ventas'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }

    // Line Chart 3
    const lineChart3 = document.getElementById('lineChart3') as HTMLCanvasElement;
    if (lineChart3) {
      new Chart(lineChart3, {
        type: 'line',
        data: {
          labels: deliveryTime.labels,
          datasets: [{
            label: 'Minutos',
            data: deliveryTime.data,
            fill: true,
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            borderColor: '#e74c3c',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Tiempo de Entrega Promedio'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  }
}