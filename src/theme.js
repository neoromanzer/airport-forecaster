// Shared design tokens — import from here instead of hard-coding hex values in components.

export const BG     = '#050b0e'; // page background
export const SURF   = '#07111a'; // card / panel surface
export const BORDER = '#0d2535'; // subtle dividers
export const CYAN   = '#00e5c8'; // primary accent (forecast, active states)
export const AMBER  = '#f5a623'; // secondary accent (historical data, warnings)
export const RED    = '#ef4444'; // negative / below-baseline
export const GREEN  = '#22c55e'; // positive / status ok
export const TEXT   = '#a8ccc8'; // body text
export const MUTED  = '#2a5050'; // de-emphasized labels
export const DIM    = '#1a3535'; // very subtle text (slider range labels)
export const MONO   = "'Space Mono','Consolas','Courier New',monospace";

// Maps the accentColor prop used by SectionCard and SliderControl to hex values.
export const ACCENT_MAP = {
  cyan:   CYAN,
  green:  GREEN,
  purple: '#a855f7',
  blue:   '#3b82f6',
  orange: '#f59e0b',
};
