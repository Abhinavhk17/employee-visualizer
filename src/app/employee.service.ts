/**
 * Employee Service
 * Handles fetching and processing employee time data from API with mock fallback
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

// Time entry from API
export interface TimeEntry {
  Id: string;
  EmployeeName: string;
  StarTimeUtc: string;        // Note: API typo "Star" not "Start"
  EndTimeUtc: string;
  EntryNotes: string;
  DeletedOn?: string | null;
}

// Processed employee summary for UI
export interface EmployeeSummary {
  name: string;
  totalHours: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';

  // Mock data for fallback
  private mockData: TimeEntry[] = [
    {
      Id: '1',
      EmployeeName: 'John Smith',
      StarTimeUtc: '2024-01-01T09:00:00',
      EndTimeUtc: '2024-01-01T17:00:00',
      EntryNotes: 'Regular work day',
      DeletedOn: null
    },
    {
      Id: '2',
      EmployeeName: 'Sarah Johnson',
      StarTimeUtc: '2024-01-01T08:30:00',
      EndTimeUtc: '2024-01-01T16:30:00',
      EntryNotes: 'Project development',
      DeletedOn: null
    },
    {
      Id: '3',
      EmployeeName: 'Mike Davis',
      StarTimeUtc: '2024-01-01T10:00:00',
      EndTimeUtc: '2024-01-01T15:00:00',
      EntryNotes: 'Part-time work',
      DeletedOn: null
    },
    {
      Id: '4',
      EmployeeName: 'John Smith',
      StarTimeUtc: '2024-01-02T09:00:00',
      EndTimeUtc: '2024-01-02T18:00:00',
      EntryNotes: 'Extended work day',
      DeletedOn: null
    },
    {
      Id: '5',
      EmployeeName: 'Sarah Johnson',
      StarTimeUtc: '2024-01-02T08:00:00',
      EndTimeUtc: '2024-01-02T17:00:00',
      EntryNotes: 'Client meeting and development',
      DeletedOn: null
    },
    {
      Id: '6',
      EmployeeName: 'Lisa Anderson',
      StarTimeUtc: '2024-01-01T09:00:00',
      EndTimeUtc: '2024-01-01T13:00:00',
      EntryNotes: 'Morning shift only',
      DeletedOn: null
    },
    {
      Id: '7',
      EmployeeName: 'John Smith',
      StarTimeUtc: '2024-01-03T09:00:00',
      EndTimeUtc: '2024-01-03T17:30:00',
      EntryNotes: 'Regular work day',
      DeletedOn: null
    },
    {
      Id: '8',
      EmployeeName: 'David Wilson',
      StarTimeUtc: '2024-01-01T07:00:00',
      EndTimeUtc: '2024-01-01T19:00:00',
      EntryNotes: 'Long work day',
      DeletedOn: null
    }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Fetch time entries from API with mock fallback
   */
  getTimeEntries(): Observable<TimeEntry[]> {
    console.log('Attempting to fetch data from API:', this.apiUrl);
    return this.http.get<TimeEntry[]>(this.apiUrl).pipe(
      map(data => {
        console.log('Successfully fetched data from API:', data.length, 'entries');
        return data;
      }),
      catchError(error => {
        console.error('Failed to fetch data from API:', error);
        console.log('Using mock data instead');
        return of(this.mockData);
      })
    );
  }

  /**
   * Get processed employee summaries sorted by hours
   */
  getEmployeeSummary(): Observable<EmployeeSummary[]> {
    return this.getTimeEntries().pipe(
      map(entries => this.processTimeEntries(entries))
    );
  }

  /**
   * Process time entries into employee summaries with totals and percentages
   */
  private processTimeEntries(entries: TimeEntry[]): EmployeeSummary[] {
    const employeeMap = new Map<string, number>();

    // Sum hours for each employee
    entries.forEach(entry => {
      // Skip deleted entries
      if (entry.DeletedOn) {
        return;
      }

      const employeeName = entry.EmployeeName;
      let durationHours = 0;

      // Calculate hours from start/end times
      if (entry.StarTimeUtc && entry.EndTimeUtc) {
        const startTime = new Date(entry.StarTimeUtc);
        const endTime = new Date(entry.EndTimeUtc);
        
        // Skip invalid time entries
        if (endTime.getTime() > startTime.getTime()) {
          durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        } else {
          console.warn(`Invalid time entry for ${employeeName}: ${entry.StarTimeUtc} to ${entry.EndTimeUtc}`);
          return;
        }
      }

      // Add to employee's total
      if (employeeMap.has(employeeName)) {
        employeeMap.set(employeeName, employeeMap.get(employeeName)! + durationHours);
      } else {
        employeeMap.set(employeeName, durationHours);
      }
    });

    // Convert to array and sort by hours
    const employeeSummaries: EmployeeSummary[] = Array.from(employeeMap.entries())
      .map(([name, totalHours]) => ({
        name,
        totalHours: Math.round(totalHours * 10) / 10,
        percentage: 0
      }))
      .sort((a, b) => b.totalHours - a.totalHours);

    // Calculate percentages
    const totalHours = employeeSummaries.reduce((sum, emp) => sum + emp.totalHours, 0);
    employeeSummaries.forEach(emp => {
      emp.percentage = Math.round((emp.totalHours / totalHours) * 100 * 10) / 10;
    });

    return employeeSummaries;
  }
}
