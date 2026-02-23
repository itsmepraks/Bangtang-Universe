interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  maxHeight?: string;
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
}

export default function DataTable<T>({ columns, data, onRowClick, maxHeight, emptyMessage = 'No data', keyExtractor }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-white/40">{emptyMessage}</div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/[0.06] overflow-x-auto ${maxHeight ? 'pretty-scrollbar' : ''}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map(col => (
              <th
                key={col.key}
                className="py-3 px-4 text-left text-xs font-medium text-white/50 uppercase tracking-wide"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={`border-b border-white/[0.03] transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : ''
              } ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
            >
              {columns.map(col => (
                <td key={col.key} className="py-3.5 px-4">
                  {col.render(item, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
