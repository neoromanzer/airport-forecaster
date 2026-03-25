const CYAN   = '#00e5c8';
const GREEN  = '#22c55e';
const RED    = '#ef4444';
const SURF   = '#07111a';
const BORDER = '#0d2535';
const MUTED  = '#2a5050';
const MONO   = "'Space Mono','Consolas','Courier New',monospace";

export default function MetricCard({ label, value, delta, unit = '', sub }) {
  const isPos = delta > 0;
  const isNeg = delta < 0;

  return (
    <div style={{
      background: SURF,
      border: `1px solid ${BORDER}`,
      borderTop: `2px solid ${CYAN}50`,
      padding: '12px 14px',
      fontFamily: MONO,
    }}>
      <p style={{ fontSize: 9, color: MUTED, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: 1 }}>{value}</p>
      {delta !== undefined && (
        <p style={{ fontSize: 9, margin: '0 0 2px', color: isPos ? GREEN : isNeg ? RED : MUTED, letterSpacing: 1 }}>
          {isPos ? '▲' : isNeg ? '▼' : '—'} {Math.abs(delta)}{unit} VS BASELINE
        </p>
      )}
      {sub && <p style={{ fontSize: 9, color: MUTED, margin: 0, letterSpacing: 1 }}>{sub}</p>}
    </div>
  );
}
