export default function MetricCard({ label, value, delta, unit = '', sub }) {
  const isPos = delta > 0;
  const isNeg = delta < 0;

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums">{value}{unit}</p>
      {delta !== undefined && (
        <p className={`text-xs font-medium mt-1 ${isPos ? 'text-green-400' : isNeg ? 'text-red-400' : 'text-slate-500'}`}>
          {isPos ? '▲' : isNeg ? '▼' : '—'} {Math.abs(delta)}{unit} vs baseline
        </p>
      )}
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}
