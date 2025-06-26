/**
 * Main Application Component
 * Handles employee time visualization with table and pie chart display
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, EmployeeSummary } from './employee.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'employee-visualizer';
  employees: EmployeeSummary[] = [];
  loading = true;
  error: string | null = null;

  constructor(private employeeService: EmployeeService) {}

  /**
   * Initialize component and load data
   */
  ngOnInit() {
    this.loadEmployeeData();
  }

  /**
   * Load employee data from service
   */
  private loadEmployeeData() {
    console.log('Loading employee data...');
    this.employeeService.getEmployeeSummary().subscribe({
      next: (data) => {
        console.log('Received employee summary:', data);
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.error = 'Failed to load employee data. Please try again later.';
        this.loading = false;
      }
    });
  }

  /**
   * Check if employee has low hours (< 100)
   */
  isLowHours(hours: number): boolean {
    return hours < 100;
  }

  /**
   * Get color for pie chart slice
   */
  getPieColor(index: number): string {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6B6B', '#4ECDC4', 
      '#45B7D1', '#96CEB4'
    ];
    return colors[index % colors.length];
  }

  /**
   * Generate CSS for pie chart background
   */
  getPieChartStyle(): string {
    if (this.employees.length === 0) {
      return 'background: #e5e7eb;';
    }

    const totalHours = this.employees.reduce((sum, emp) => sum + emp.totalHours, 0);
    let currentAngle = 0;
    const segments: string[] = [];
    
    this.employees.forEach((employee, index) => {
      const percentage = (employee.totalHours / totalHours) * 100;
      const degrees = (percentage / 100) * 360;
      
      const color = this.getPieColor(index);
      const startAngle = currentAngle;
      const endAngle = currentAngle + degrees;
      
      // Add segments with white borders between them
      if (index > 0) {
        // Add a thin white separator before each slice (except the first)
        segments.push(`white ${currentAngle - 0.5}deg ${currentAngle + 0.5}deg`);
      }
      
      segments.push(`${color} ${startAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    });

    return `background: conic-gradient(${segments.join(', ')});`;
  }

  /**
   * Generate SVG path for pie slice
   */
  getPieSlicePath(index: number): string {
    const totalHours = this.employees.reduce((sum, emp) => sum + emp.totalHours, 0);
    const centerX = 125;
    const centerY = 125;
    const radius = 100;
    
    // Calculate starting angle
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      const percentage = (this.employees[i].totalHours / totalHours) * 100;
      startAngle += (percentage / 100) * 360;
    }
    
    // Calculate this slice's angle
    const percentage = (this.employees[index].totalHours / totalHours) * 100;
    const sliceAngle = (percentage / 100) * 360;
    const endAngle = startAngle + sliceAngle;
    
    // Convert to radians (start from top)
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Large arc flag for slices > 180 degrees
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    // Create SVG path: Move to center, Line to start, Arc to end, Close
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  /**
   * Retry loading data after error
   */
  retryLoad() {
    this.loading = true;
    this.error = null;
    this.loadEmployeeData();
  }
}
