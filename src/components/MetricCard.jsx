import { CYAN, GREEN, RED, SURF, BORDER, MUTED, MONO } from '../theme';

/**
 * A single KPI tile shown in the top row of the right panel.
 *
 * Props:
 *   label — small uppercase heading
 *   value — primary display value (pre-formatted string, e.g. '16.9M')
 *   delta — numeric difference vs baseline; drives the ▲/▼ indicator and colour.
 *           Pass undefined to hide the delta row entirely.
 *   unit  — suffix appended to the delta value (e.g. 'M', '%')
 *   sub   — secondary line of text below the delta (e.g. 'BASELINE ×1.28')
 */
export default function MetricCard({ label, value, delta, unit = '', sub }) {
  const isPos = delta > 0;
  const isNeg = delta < 0;

  return (
    <div style={{
      background:  SURF,
      border:      `1px solid ${BORDER}`,
      borderTop:   `2px solid ${CYAN}50`, // subtle cyan top stripe links the cards visually
      padding:     '12px 14px',
      fontFamily:  MONO,
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
