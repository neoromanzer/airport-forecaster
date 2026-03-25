const ACCENT_MAP = {
  cyan:   '#00e5c8',
  green:  '#22c55e',
  purple: '#a855f7',
  blue:   '#3b82f6',
};

const MUTED = '#2a5050';
const DIM   = '#1a3535';

export default function SliderControl({ label, value, min, max, step = 0.5, unit = '%', onChange, description, color = 'cyan' }) {
  const accent = ACCENT_MAP[color] ?? ACCENT_MAP.cyan;
  const isPos  = value > 0;
  const isNeg  = value < 0;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <label style={{ fontSize: 9, color: MUTED, letterSpacing: 1.5 }}>{label}</label>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: isPos ? accent : isNeg ? '#ef4444' : '#334155',
          letterSpacing: 1, minWidth: 44, textAlign: 'right',
        }}>
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      {description && (
        <p style={{ fontSize: 9, color: DIM, margin: '0 0 6px', lineHeight: 1.6, letterSpacing: 0.5 }}>{description}</p>
      )}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: accent, cursor: 'pointer', height: 2 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: DIM, marginTop: 2, letterSpacing: 1 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
