import {Component, OnInit} from '@angular/core';
import {SystemHealth} from './interface/system-health';
import {SystemCpu} from './interface/system-cpu';
import {DashboardService} from './service/dashboard.service';
import {HttpErrorResponse} from '@angular/common/http';
import Chart from 'chart.js/auto';
import {ChartType} from './enum/chart-type.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public traceList: any[] = [];
  public selectedTrace: any;
  public systemHealth: SystemHealth;
  public systemCpu: SystemCpu;
  public processUpTime: string;
  public http200Traces: any[] = [];
  public http400Traces: any[] = [];
  public http404Traces: any[] = [];
  public http500Traces: any[] = [];
  public httpDefaultTraces: any[] = [];
  public timestamp: number;
  public pageSize = 10;
  public page = 1;

  constructor(private dashboardService: DashboardService) {
    this.dashboardService.getHttpTraces().subscribe(
      (response: any) => {
        console.log(response.traces);
        this.processTraces(response.traces);
      }
    );
  }

  ngOnInit(): void {
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProcessUpTime(true);
  }

  private getTraces(): void {
    this.dashboardService.getHttpTraces().subscribe(
      (response: any) => {
        console.log(response.traces);
        this.processTraces(response.traces);
        this.initializeBarChart();
        this.initializePieChart();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  private getCpuUsage(): void {
    this.dashboardService.getSystemCpu().subscribe(
      (response: SystemCpu) => {
        console.log(response);
        this.systemCpu = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  private getSystemHealth(): void {
    this.dashboardService.getSystemHealth().subscribe(
      (response: SystemHealth) => {
        console.log(response);
        this.systemHealth = response;
        this.systemHealth.components.diskSpace.details.free = this.formatBytes(this.systemHealth.components.diskSpace.details.free);
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public onRefreshData(): void {
    this.http200Traces = [];
    this.http400Traces = [];
    this.http500Traces = [];
    this.http404Traces = [];
    this.httpDefaultTraces = [];
    this.getTraces();
    this.getCpuUsage();
    this.getSystemHealth();
    this.getProcessUpTime(false);
  }

  private getProcessUpTime(isUpdateTime: boolean): void {
    this.dashboardService.getProcessUpTime().subscribe(
      (response: any) => {
        console.log(response);
        this.timestamp = Math.round(response.measurements[0].value);
        this.processUpTime = this.formateUpTime(this.timestamp);
        if (isUpdateTime) {
          this.updateTime();
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  private processTraces(traces: any): void {
    this.traceList = traces;
    this.traceList.forEach(trace => {
      switch (trace.response.status) {
        case 200:
          this.http200Traces.push(trace);
          break;
        case 404:
          this.http404Traces.push(trace);
          break;
        case 400:
          this.http400Traces.push(trace);
          break;
        case 500:
          this.http500Traces.push(trace);
          break;
        default:
          this.httpDefaultTraces.push(trace);
          break;
      }
    });
  }

  private initializeBarChart(): Chart {
    const element = document.getElementById('barChart');
    return new Chart(element, {
      type: ChartType.BAR,
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [{
          data: [this.http200Traces.length, this.http404Traces.length, this.http400Traces.length, this.http500Traces.length],
          backgroundColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderWidth: 3
        }]
      },
      options: {
        title: {display: true, text: [`Last 100 Requests as of ${this.formatDate(new Date())}`]},
        legend: {display: false},
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

  private initializePieChart(): Chart {
    const element = document.getElementById('pieChart') as HTMLCanvasElement;
    const pie = element.getContext('2d');
    return new Chart(pie, {
      type: ChartType.DOUGHNUT,
      data: {
        labels: ['200', '404', '400', '500'],
        datasets: [{
          data: [this.http200Traces.length, this.http404Traces.length, this.http400Traces.length, this.http500Traces.length],
          backgroundColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderColor: ['rgb(40,167,69)', 'rgb(0,123,255)', 'rgb(253,126,20)', 'rgb(220,53,69)'],
          borderWidth: 3
        }]
      },
      options: {
        maintainAspectRatio: false,
        title: {display: true, text: `Last 100 Requests as of ${this.formatDate(new Date())}`},
        legend: {display: true},
        display: true,
      }
    });
  }

  public exportTableToExcel(): void {
    const downloadLink = document.createElement('a');
    const dataType = 'application/vnd.ms-excel';
    const table = document.getElementById('httptrace-table');
    const tableHTML = table.outerHTML.replace(/ /g, '%20');
    const filename = 'httptrace.xls';
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
    downloadLink.download = filename;
    downloadLink.click();
  }

  public onSelectTrace(trace: any): void {
    this.selectedTrace = trace;
    document.getElementById('trace-modal').click();
  }

  private updateTime(): void {
    setInterval(() => {
      this.processUpTime = this.formateUpTime(this.timestamp + 1);
      this.timestamp++;
    }, 1000);
  }

  private formatBytes(bytes: any): string {
    if (bytes === 0) {
      return '0 bytes';
    }
    const k = 1024;
    const dm = 2 < 0 ? 0 : 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private formateUpTime(timestamp: number): string {
    const hours = Math.floor(timestamp / 60 / 60);
    const minutes = Math.floor(timestamp / 60) - (hours * 60);
    const seconds = timestamp % 60;
    return hours.toString().padStart(2, '0') + 'h' + minutes.toString().padStart(2, '0')
      + 'm' + seconds.toString().padStart(2, '0') + 's';
  }

  private formatDate(date: Date): string {
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const year = date.getFullYear();
    if (dd < 10) {
      const day = `0${dd}`;
    }
    if (mm < 10) {
      const month = `0${mm}`;
    }
    return `${mm}/${dd}/${year}`;
  }
}
