import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Chart from 'chart.js';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // Cargar datos y crear gráficos
    this.loadChartsData();
  }

  loadChartsData() {
    // Cargar datos de Pie Charts desde mock server
    this.http.get<any>(`${environment.url_mock_charts}/charts/pie-data`).subscribe({
      next: (data) => {
        this.createPieCharts(data);
      },
      error: (error) => {
        console.error('Error cargando pie charts:', error);
        this.createPieCharts(null); // Usar datos por defecto
      }
    });

    // Cargar datos de Bar Charts
    this.http.get<any>(`${environment.url_mock_charts}/charts/bar-data`).subscribe({
      next: (data) => {
        this.createBarCharts(data);
      },
      error: (error) => {
        console.error('Error cargando bar charts:', error);
        this.createBarCharts(null);
      }
    });

    // Cargar datos de Line Charts
    this.http.get<any>(`${environment.url_mock_charts}/charts/line-data`).subscribe({
      next: (data) => {
        this.createLineCharts(data);
      },
      error: (error) => {
        console.error('Error cargando line charts:', error);
        this.createLineCharts(null);
      }
    });
  }

  // ========== PIE CHARTS ==========
  createPieCharts(data?: any) {
    const ordersStatus = data?.ordersStatus || {
      labels: ['Entregados', 'En Camino', 'Pendientes', 'Cancelados'],
      data: [45, 25, 20, 10]
    };

    const topProducts = data?.topProducts || {
      labels: ['Hamburguesas', 'Pizzas', 'Bebidas', 'Postres', 'Otros'],
      data: [30, 25, 20, 15, 10]
    };

    const restaurantSales = data?.restaurantSales || {
      labels: ['Restaurant A', 'Restaurant B', 'Restaurant C', 'Restaurant D'],
      data: [35, 30, 20, 15]
    };

    // Pie Chart 1
    var pieChart1 = document.getElementById('pieChart1');
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

    // Pie Chart 2
    var pieChart2 = document.getElementById('pieChart2');
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

    // Pie Chart 3 (Doughnut)
    var pieChart3 = document.getElementById('pieChart3');
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
  }

  // ========== BAR CHARTS ==========
  createBarCharts(data?: any) {
    const ordersByDay = data?.ordersByDay || {
      labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      data: [45, 52, 48, 60, 75, 90, 85]
    };

    const monthlyRevenue = data?.monthlyRevenue || {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      data: [12000, 15000, 13500, 18000, 20000, 22000]
    };

    const driversByShift = data?.driversByShift || {
      labels: ['Mañana', 'Tarde', 'Noche'],
      data: [15, 20, 18]
    };

    // Bar Chart 1
    var barChart1 = document.getElementById('barChart1');
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

    // Bar Chart 2
    var barChart2 = document.getElementById('barChart2');
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

    // Bar Chart 3
    var barChart3 = document.getElementById('barChart3');
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

  // ========== LINE CHARTS ==========
  createLineCharts(data?: any) {
    const dailyOrders = data?.dailyOrders || {
      labels: Array.from({length: 30}, (_, i) => `Día ${i + 1}`),
      data: [45, 50, 48, 52, 55, 60, 58, 62, 65, 68, 70, 72, 75, 78, 80, 
             82, 85, 88, 90, 87, 85, 83, 80, 78, 75, 73, 70, 68, 65, 62]
    };

    const yearlyComparison = data?.yearlyComparison || {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        {
          label: '2024',
          data: [12, 15, 13, 18, 20, 22, 25, 28, 26, 30, 32, 35]
        },
        {
          label: '2025',
          data: [15, 18, 16, 20, 23, 26, 28, 32, 30, 35, 38, 40]
        }
      ]
    };

    const deliveryTime = data?.deliveryTime || {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
      data: [35, 32, 30, 28, 27, 25, 24, 23]
    };

    // Line Chart 1
    var lineChart1 = document.getElementById('lineChart1');
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

    // Line Chart 2
    var lineChart2 = document.getElementById('lineChart2');
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

    // Line Chart 3
    var lineChart3 = document.getElementById('lineChart3');
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