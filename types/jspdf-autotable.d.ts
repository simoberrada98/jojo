declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: Partial<CellDef>;
    bodyStyles?: Partial<CellDef>;
    footStyles?: Partial<CellDef>;
    alternateRowStyles?: Partial<CellDef>;
    columnStyles?: { [key: string]: Partial<CellDef> };
    styles?: Partial<CellDef>;
    didDrawPage?: (data: any) => void;
    didParseCell?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    willDrawPage?: (data: any) => void;
  }

  export interface CellDef {
    cellWidth?: 'auto' | 'wrap' | number;
    minCellWidth?: number;
    minCellHeight?: number;
    halign?: 'left' | 'center' | 'right' | 'justify';
    valign?: 'top' | 'middle' | 'bottom';
    fontSize?: number;
    cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    lineColor?: [number, number, number] | number;
    lineWidth?: number;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    fillColor?: [number, number, number] | false;
    textColor?: [number, number, number] | number;
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
