import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { YearProjection, Asset } from '../types';
import { formatCompact, formatCurrency } from '../utils/format';

type Props = {
  projections: YearProjection[];
  assets: Asset[];
};

type ChartMode = 'overlay' | 'stacked';

export function ProjectionChart({ projections, assets }: Props) {
  const [mode, setMode] = useState<ChartMode>('overlay');
  const [logScale, setLogScale] = useState(false);

  const data = useMemo(() => {
    return projections.map((p) => {
      const row: Record<string, number | string> = {
        year: p.year,
        age: p.age,
        nominal: round(p.totalNominal),
        presentValue: round(p.totalPresentValue),
        contributed: round(p.totalContributed),
      };
      for (const a of assets) {
        row[a.id] = round(p.assetValues[a.id] ?? 0);
      }
      return row;
    });
  }, [projections, assets]);

  const yScale = logScale ? 'log' : 'linear';
  // recharts accepts a function or 'auto' at runtime; cast to satisfy its narrow tuple type
  const yDomain = (logScale
    ? [(dataMin: number) => Math.max(1, Math.floor(dataMin * 0.8)), 'auto']
    : [0, 'auto']) as unknown as [number, number];

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="heading-serif text-base">Proyección del portafolio</h2>
        <div className="flex items-center gap-1.5 text-xs">
          <ToggleButton active={mode === 'overlay'} onClick={() => setMode('overlay')}>
            Líneas
          </ToggleButton>
          <ToggleButton active={mode === 'stacked'} onClick={() => setMode('stacked')}>
            Por activo
          </ToggleButton>
          <span className="w-px h-4 bg-white/10 mx-1" />
          <ToggleButton active={logScale} onClick={() => setLogScale((v) => !v)}>
            log
          </ToggleButton>
        </div>
      </div>

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'overlay' ? (
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g-nominal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a961" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#c9a961" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                label={{ value: 'Años', position: 'insideBottomRight', offset: -2, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(v) => formatCompact(Number(v))}
                scale={yScale}
                domain={yDomain}
                allowDataOverflow
              />
              <Tooltip content={<CustomTooltip assets={assets} mode="overlay" />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Line
                type="monotone"
                dataKey="nominal"
                name="Valor nominal"
                stroke="#c9a961"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#e0c98a' }}
                isAnimationActive
              />
              <Line
                type="monotone"
                dataKey="presentValue"
                name="Valor presente"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#93c5fd' }}
                isAnimationActive
              />
              <Line
                type="monotone"
                dataKey="contributed"
                name="Total aportado"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="2 4"
                dot={false}
                isAnimationActive
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(v) => formatCompact(Number(v))}
                scale={yScale}
                domain={yDomain}
                allowDataOverflow
              />
              <Tooltip content={<CustomTooltip assets={assets} mode="stacked" />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {assets.map((a) => (
                <Area
                  key={a.id}
                  type="monotone"
                  dataKey={a.id}
                  name={a.name}
                  stackId="portfolio"
                  stroke={a.color ?? '#888'}
                  fill={a.color ?? '#888'}
                  fillOpacity={0.55}
                  strokeWidth={1.5}
                  isAnimationActive
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md border transition-colors ${
        active
          ? 'bg-gold/15 border-gold/30 text-gold-soft'
          : 'bg-bg-muted border-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

type TooltipPayload = {
  payload: Record<string, number>;
  value: number;
  dataKey: string;
  color?: string;
  name?: string;
};

function CustomTooltip({
  active,
  payload,
  label,
  assets,
  mode,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number;
  assets: Asset[];
  mode: ChartMode;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-bg-elevated/95 backdrop-blur border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-xl shadow-black/50 min-w-[200px]">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-serif text-slate-300">Año {label}</span>
        <span className="num text-[10px] text-slate-500">edad {row.age}</span>
      </div>
      <div className="space-y-1">
        {mode === 'overlay' ? (
          <>
            <Row color="#c9a961" label="Nominal" value={row.nominal} />
            <Row color="#60a5fa" label="Presente" value={row.presentValue} />
            <Row color="#64748b" label="Aportado" value={row.contributed} />
          </>
        ) : (
          <>
            {assets.map((a) => (
              <Row key={a.id} color={a.color ?? '#888'} label={a.name} value={row[a.id] ?? 0} />
            ))}
            <div className="border-t border-white/5 my-1" />
            <Row color="#c9a961" label="Total" value={row.nominal} />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-slate-300">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="num text-slate-100">{formatCurrency(value)}</span>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n);
}
