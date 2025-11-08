import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '@/lib/contexts/cart-context';

interface InvoiceData {
  orderNumber: string;
  date: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  estimatedDelivery: string;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor: [number, number, number] = [16, 185, 129]; // Accent green
  const darkColor: [number, number, number] = [15, 23, 42]; // Dark slate
  const grayColor: [number, number, number] = [100, 116, 139]; // Muted gray

  // Header - Company Logo & Info
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Jhuangnyc', 20, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Mining Hardware', 20, 28);
  doc.text('contact@jhuangnyc.com | +1 (631) 224-3534', 20, 34);

  // Invoice Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);

  // Invoice Details
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order #: ${data.orderNumber}`, 150, 28);
  doc.text(`Date: ${data.date}`, 150, 34);

  // Bill To Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(data.email, 20, 62);

  // Delivery Information
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Estimated Delivery:', 120, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(data.estimatedDelivery, 120, 62);

  // Items Table
  const tableColumn = ['Item', 'Quantity', 'Price', 'Total'];
  const tableRows = data.items.map((item) => [
    item.name,
    item.quantity.toString(),
    `${item.priceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
    `${(item.priceUSD * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} `,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 75,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
  }

  // Get the final Y position after the table
  const finalY = (doc as jsPDFWithAutoTable).lastAutoTable.finalY || 75;

  // Summary Section
  const summaryStartY = finalY + 15;
  const summaryX = 130;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

  // Subtotal
  doc.text('Subtotal:', summaryX, summaryStartY);
  doc.text(
    `$${data.subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} USD`,
    190,
    summaryStartY,
    {
      align: 'right',
    }
  );

  // Shipping
  doc.text('Shipping:', summaryX, summaryStartY + 7);
  doc.text(
    `$${data.shipping.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} USD`,
    190,
    summaryStartY + 7,
    {
      align: 'right',
    }
  );

  // Tax
  doc.text('Tax:', summaryX, summaryStartY + 14);
  doc.text(`$${data.tax.toFixed(2)} USD`, 190, summaryStartY + 14, {
    align: 'right',
  });

  // Line
  doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setLineWidth(0.5);
  doc.line(summaryX, summaryStartY + 20, 190, summaryStartY + 20);

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Total:', summaryX, summaryStartY + 28);
  doc.text(
    `$${data.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} USD`,
    190,
    summaryStartY + 28,
    {
      align: 'right',
    }
  );

  if (data.currency !== 'USD') {
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(
      `(${data.currency} equivalent shown at checkout)`,
      190,
      summaryStartY + 35,
      { align: 'right' }
    );
  }

  // Footer
  const footerY = 270;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, footerY, 210, 27, 'F');

  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'normal');

  doc.text('Thank you for your business!', 105, footerY + 8, {
    align: 'center',
  });
  doc.text(
    'For questions or support, contact us at contact@jhuangnyc.com',
    105,
    footerY + 14,
    { align: 'center' }
  );
  doc.text(
    'Jhuangnyc | Premium Mining Hardware | www.jhuangnyc.com',
    105,
    footerY + 20,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Jhuangnyc_Invoice_${data.orderNumber}.pdf`);
};
