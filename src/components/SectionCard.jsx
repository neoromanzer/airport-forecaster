import { ACCENT_MAP, SURF, BORDER, MUTED, MONO } from '../theme';

/**
 * A titled panel with a coloured left-border accent, used to group related sliders.
 *
 * Props:
 *   title       — uppercase section heading
 *   subtitle    — optional secondary label shown below the title
 *   accentColor — key into ACCENT_MAP (default 'cyan')
 *   children    — slider controls or other content rendered inside the card body
 */
export default function SectionCard({ title, subtitle, children, accentColor = 'cyan' }) {
  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.cyan;

  return (
    <div style={{
      background:  SURF,
      border:      `1px solid ${BORDER}`,
      borderLeft:  `3px solid ${accent}`, // coloured accent stripe identifies the group at a glance
      fontFamily:  MONO,
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
