import { Measurement } from '../models/Measurement';
import { createObjectCsvStringifier } from 'csv-writer';
import PDFDocument from 'pdfkit';
import { Chart } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

class ExportService {
  async exportData(userId: number, format: string, options: any) {
    const measurements = await this.getMeasurements(userId, options.dateRange);

    switch (format) {
      case 'csv':
        return this.exportToCsv(measurements);
      case 'pdf':
        return this.exportToPdf(measurements, options.includeCharts);
      case 'json':
        return this.exportToJson(measurements);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private async getMeasurements(userId: number, dateRange: string) {
    const whereClause: any = { userId };

    if (dateRange !== 'all') {
      const date = new Date();
      switch (dateRange) {
        case 'last30':
          date.setDate(date.getDate() - 30);
          break;
        case 'last90':
          date.setDate(date.getDate() - 90);
          break;
      }
      whereClause.createdAt = {
        [Op.gte]: date
      };
    }

    return await Measurement.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
  }

  private async exportToCsv(measurements: Measurement[]) {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'shoulderWidth', title: 'Shoulder Width' },
        { id: 'chestCircumference', title: 'Chest' },
        { id: 'waistCircumference', title: 'Waist' },
        { id: 'hipCircumference', title: 'Hip' },
        { id: 'inseamLength', title: 'Inseam' }
      ]
    });

    const records = measurements.map(m => ({
      date: new Date(m.createdAt).toLocaleDateString(),
      shoulderWidth: m.shoulderWidth,
      chestCircumference: m.chestCircumference,
      waistCircumference: m.waistCircumference,
      hipCircumference: m.hipCircumference,
      inseamLength: m.inseamLength
    }));

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  }

  private async exportToPdf(measurements: Measurement[], includeCharts: boolean) {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Add title
    doc.fontSize(20).text('Measurement History Report', { align: 'center' });
    doc.moveDown();

    // Add measurements table
    this.addMeasurementsTable(doc, measurements);

    if (includeCharts) {
      doc.addPage();
      await this.addCharts(doc, measurements);
    }

    doc.end();

    return Buffer.concat(buffers);
  }

  private async addCharts(doc: PDFKit.PDFDocument, measurements: Measurement[]) {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 500, height: 300 });
    
    // Create trend chart
    const chartData = {
      labels: measurements.map(m => new Date(m.createdAt).toLocaleDateString()),
      datasets: [
        {
          label: 'Chest',
          data: measurements.map(m => m.chestCircumference),
          borderColor: 'rgb(255, 99, 132)'
        },
        {
          label: 'Waist',
          data: measurements.map(m => m.waistCircumference),
          borderColor: 'rgb(54, 162, 235)'
        }
      ]
    };

    const chartImage = await chartJSNodeCanvas.renderToBuffer({
      type: 'line',
      data: chartData,
      options: {
        scales: { y: { beginAtZero: false } }
      }
    });

    doc.image(chartImage, 50, 50, { width: 500 });
  }

  private exportToJson(measurements: Measurement[]) {
    return JSON.stringify(measurements, null, 2);
  }
}

export const exportService = new ExportService();