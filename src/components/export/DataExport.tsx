import React, { useState } from 'react';
import { Measurement } from '../../types/measurement';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  dateRange: 'all' | 'last30' | 'last90' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeCharts: boolean;
}

const DataExport: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'all',
    includeCharts: true
  });
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/measurements/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportOptions)
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `measurements-export-${new Date().toISOString()}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-export">
      <h2>Export Measurements Data</h2>
      
      <div className="export-options">
        <div className="option-group">
          <label>Export Format</label>
          <select
            value={exportOptions.format}
            onChange={(e) => setExportOptions({
              ...exportOptions,
              format: e.target.value as 'csv' | 'pdf' | 'json'
            })}
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div className="option-group">
          <label>Date Range</label>
          <select
            value={exportOptions.dateRange}
            onChange={(e) => setExportOptions({
              ...exportOptions,
              dateRange: e.target.value as ExportOptions['dateRange']
            })}
          >
            <option value="all">All Time</option>
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {exportOptions.dateRange === 'custom' && (
          <div className="custom-date-range">
            <div className="option-group">
              <label>Start Date</label>
              <input
                type="date"
                value={exportOptions.customStartDate}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  customStartDate: e.target.value
                })}
              />
            </div>
            <div className="option-group">
              <label>End Date</label>
              <input
                type="date"
                value={exportOptions.customEndDate}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  customEndDate: e.target.value
                })}
              />
            </div>
          </div>
        )}

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={exportOptions.includeCharts}
              onChange={(e) => setExportOptions({
                ...exportOptions,
                includeCharts: e.target.checked
              })}
            />
            Include Charts and Visualizations (PDF only)
          </label>
        </div>
      </div>

      <button 
        className="export-button"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? 'Exporting...' : 'Export Data'}
      </button>
    </div>
  );
};

export default DataExport; 