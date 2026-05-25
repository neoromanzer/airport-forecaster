import { ACCENT_MAP, SURF, BORDER, MUTED, MONO } from '../theme';

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
