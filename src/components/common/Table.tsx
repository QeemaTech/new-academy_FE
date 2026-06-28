import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
}

interface Props {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export default function Table({ columns, data, emptyMessage = 'لا توجد بيانات' }: Props) {
  if (data.length === 0) {
    return (
      <div className="na-card text-center py-5">
        <i className="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
        <p className="text-muted mb-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="na-table">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

