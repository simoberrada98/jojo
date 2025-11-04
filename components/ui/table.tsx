'use client';

import { cn } from '@/lib/utils';

type TableProps<T> = {
  columns: {
    header: string;
    accessor: keyof T;
    cell?: (value: T[keyof T]) => React.ReactNode;
  }[];
  data: T[];
};

export function Table<T>({ columns, data }: TableProps<T>) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background border-border border-b">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="px-6 py-4 font-semibold text-foreground/70 text-left"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-background border-border border-b transition"
              >
                {columns.map((column) => (
                  <td key={column.header} className="px-6 py-4">
                    {column.cell
                      ? column.cell(row[column.accessor])
                      : (row[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
