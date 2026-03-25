const ACCENT_MAP = {
  cyan:   '#00e5c8',
  green:  '#22c55e',
  purple: '#a855f7',
  blue:   '#3b82f6',
  orange: '#f59e0b',
};

const SURF   = '#07111a';
const BORDER = '#0d2535';
const MUTED  = '#2a5050';
const MONO   = "'Space Mono','Consolas','Courier New',monospace";

export default function SectionCard({ title, subtitle, children, accentColor = 'cyan' }) {
  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.cyan;

  return (
    <div style={{
      background: SURF,
      border: `1px solid ${BORDER}`,
      borderLeft: `3px solid ${accent}`,
      fontFamily: MONO,
    }}>
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '9px 14px' }}>
        <h3 style={{ margin: 0, fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 2 }}>{title}</h3>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 9, color: MUTED, letterSpacing: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '14px 14px 2px' }}>
        {children}
      </div>
    </div>
  );
}
