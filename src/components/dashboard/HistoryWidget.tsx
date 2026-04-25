import { useState } from 'react';
import { History } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Pagination } from '../ui/Pagination';

export interface HistoryRecord {
  id: string;
  commodity: string;
  type: 'buy' | 'sell' | 'hedge';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const TYPE_ICON   = { buy: '📈', sell: '📉', hedge: '🛡️' };
const TYPE_COLOR  = { buy: 'text-agro-primary', sell: 'text-agro-danger', hedge: 'text-agro-accent' };
const STATUS_VAR  = { completed: 'primary', pending: 'warning', failed: 'danger' } as const;

export const HistoryWidget = ({ records }: { records: HistoryRecord[] }) => {
  const [page, setPage] = useState(1);
  const PER_PAGE   = 10;
  const totalPages = Math.max(1, Math.ceil(records.length / PER_PAGE));
  const paged      = records.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Histórico de Negociações"
        subtitle="TimescaleDB · history"
        icon={<History size={16} />}
        action={<Badge variant="gray" size="sm">{records.length} registros</Badge>}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              {['Data', 'Commodity', 'Tipo', 'Qtd', 'Preço', 'Total', 'Status'].map(h => (
                <th key={h} className="px-3 py-2 text-xs font-semibold text-text-muted text-left last:text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {paged.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-10 text-center text-text-muted">Nenhum registro</td></tr>
            ) : paged.map(r => (
              <tr key={r.id} className="hover:bg-surface/30 transition-colors">
                <td className="px-3 py-2.5 text-xs text-text-muted tabular-nums">
                  {new Date(r.timestamp).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-3 py-2.5 font-semibold text-text-primary capitalize">{r.commodity}</td>
                <td className={`px-3 py-2.5 font-bold text-xs ${TYPE_COLOR[r.type]}`}>
                  {TYPE_ICON[r.type]} {r.type === 'buy' ? 'Compra' : r.type === 'sell' ? 'Venda' : 'Hedge'}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-text-muted">{r.quantity}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-text-primary">{r.price.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right font-bold font-mono tabular-nums text-agro-primary">R$ {r.total.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2.5 text-center">
                  <Badge variant={STATUS_VAR[r.status]} size="sm">{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showTotal
          totalItems={records.length}
          pageSize={PER_PAGE}
        />
      )}
    </Card>
  );
};
