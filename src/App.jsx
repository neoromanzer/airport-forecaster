import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

import { generateForecast, generateBaseline } from './model/forecast';
import SliderControl from './components/SliderControl';
import SectionCard from './components/SectionCard';
import MetricCard from './components/MetricCard';
import { BG, SURF, BORDER, CYAN, AMBER, RED, GREEN, TEXT, MUTED, ACCENT_MAP, MONO } from './theme';
import './index.css';

const HISTORICAL_DATA = [
  { year: 2018, passengersM: 10.8 },
  { year: 2019, passengersM: 11.9 },
  { year: 2020, passengersM: 4.5 },
  { year: 2021, passengersM: 6.9 },
  { year: 2022, passengersM: 10.1 },
  { year: 2023, passengersM: 11.6 },
];

const DEFAULT_PARAMS = {
  gdpGrowth: 2.0,
  tourismGrowth: 1.0,
  fuelPriceChange: 0,
  mainAirlineCapacityChange: 0,
  newRoutesImpact: 0,
  lccEntryBoost: 0,
  incentiveProgram: 0,
  terminalExpansion: 0,
  connectivityImprovement: 0,
};

const FORECAST_YEARS = 7;

function cagr(start, end, years) {
  return (((end / start) ** (1 / years)) - 1) * 100;
}

function riskBadge(yoy) {
  if (Math.abs(yoy) < 4) return { label: 'LOW', color: CYAN, bg: CYAN+'12', border: CYAN+'50' };
  if (Math.abs(yoy) < 9) return { label: 'MED', color: AMBER, bg: AMBER+'12', border: AMBER+'50' };
  return { label: 'HIGH', color: RED, bg: RED+'12', border: RED+'50' };
}

const HudTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#020c12', border: `1px solid ${CYAN}`, padding: '8px 12px', fontSize: 11, fontFamily: 'monospace', boxShadow: `0 0 12px ${CYAN}20` }}>
      <p style={{ margin: '0 0 4px', color: CYAN, fontWeight: 700, letterSpacing: 2, fontSize: 10 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 1 }}>
          <span style={{ color: p.color, fontSize: 10 }}>{p.name === 'forecast' ? 'SCENARIO' : p.name === 'baseline' ? 'BASELINE' : 'ACTUAL'}</span>
          <span style={{ color: '#fff' }}>{p.value?.toFixed(2)}M</span>
        </div>
      ))}
    </div>
  );
};

function Clock() {
  const [time, setTime] = useState(() => new Date().toISOString().slice(11, 19));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 12, textAlign: 'right' }}>
      <div style={{ color: CYAN, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>{time}</div>
      <div style={{ color: MUTED, fontSize: 8 }}>UTC</div>
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const set = useCallback((key) => (val) => setParams(p => ({ ...p, [key]: val })), []);

  const forecast = useMemo(() => generateForecast(params, FORECAST_YEARS), [params]);
  const baseline = useMemo(() => generateBaseline(FORECAST_YEARS), []);

  const chartData = useMemo(() => [
    ...HISTORICAL_DATA.map(h => ({ year: h.year, historical: h.passengersM, forecast: null, baseline: null })),
    { year: 2024, historical: forecast[0].passengersM, forecast: forecast[0].passengersM, baseline: baseline[0].passengersM },
    ...forecast.slice(1).map((f, i) => ({ year: f.year, historical: null, forecast: f.passengersM, baseline: baseline[i + 1].passengersM })),
  ], [forecast, baseline]);

  const contribData = useMemo(() => forecast.slice(1).map(f => ({
    year: f.year,
    MACRO:   +((f.macroContrib   - 1) * 100).toFixed(1),
    AIRLINE: +((f.airlineContrib - 1) * 100).toFixed(1),
    AIRPORT: +((f.airportContrib - 1) * 100).toFixed(1),
  })), [forecast]);

  const { lastForecast, lastBaseline, first, forecastCAGR, baselineCAGR, deltaPaxM, alertColor, alertMsg } = useMemo(() => {
    const lastForecast = forecast[forecast.length - 1];
    const lastBaseline = baseline[baseline.length - 1];
    const first        = forecast[0];
    const forecastCAGR = cagr(first.passengers, lastForecast.passengers, FORECAST_YEARS);
    const baselineCAGR = cagr(first.passengers, lastBaseline.passengers, FORECAST_YEARS);
    const deltaPaxM    = parseFloat((lastForecast.passengersM - lastBaseline.passengersM).toFixed(2));

    let alertColor, alertMsg;
    if (deltaPaxM > 2) {
      alertColor = AMBER;
      alertMsg   = `HIGH GROWTH SCENARIO · ${deltaPaxM}M PAX DELTA · CAGR ${forecastCAGR.toFixed(1)}%`;
    } else if (deltaPaxM < -1) {
      alertColor = RED;
      alertMsg   = `BELOW-BASELINE SCENARIO · ${deltaPaxM}M SHORTFALL`;
    } else {
      alertColor = CYAN;
      alertMsg   = `NOMINAL FORECAST · CAGR ${forecastCAGR.toFixed(1)}%`;
    }

    return { lastForecast, lastBaseline, first, forecastCAGR, baselineCAGR, deltaPaxM, alertColor, alertMsg };
  }, [forecast, baseline]);

  const hasChanges = Object.keys(DEFAULT_PARAMS).some(k => params[k] !== DEFAULT_PARAMS[k]);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: MONO }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: SURF }}>

        <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 3 }}>AIRPORT PASSENGER FORECASTER</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 10 }}>
            <span style={{ color: CYAN, display: 'flex', alignItems: 'center', gap: 5 }}>● MODEL ACTIVE</span>
            <span style={{ color: GREEN, display: 'flex', alignItems: 'center', gap: 5 }}>● FORECAST READY</span>
            <Clock />
          </div>
        </div>

        <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '6px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, letterSpacing: 1 }}>
          <span style={{ color: TEXT }}>BASE / APF · AIRPORT PASSENGER FORECASTER · PARAMETRIC DEMAND MODEL</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: MUTED }}>BASE: 12.5M PAX (2024)</span>
            {hasChanges && (
              <button onClick={() => setParams(DEFAULT_PARAMS)} style={{ padding: '4px 10px', background: 'transparent', border: `1px solid ${CYAN}`, color: CYAN, cursor: 'pointer', fontSize: 9, letterSpacing: 2, fontFamily: 'inherit' }}>RESET</button>
            )}
          </div>
        </div>

        <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '6px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 9, background: '#040d12', letterSpacing: 1 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ color: GREEN }}>● HISTORICAL DATA / 2018–2023 / LOADED</span>
            <span style={{ color: MUTED }}>────</span>
            <span style={{ color: CYAN }}>● FORECAST MODEL / PARAMETRIC / ACTIVE</span>
            <span style={{ color: MUTED }}>────</span>
            <span style={{ color: GREEN }}>● SCENARIO ANALYSIS / DEMAND MODEL / READY</span>
          </div>
          <span style={{ color: CYAN }}>{FORECAST_YEARS} YR FORECAST READY</span>
        </div>

        <div style={{ borderBottom: `1px solid ${BORDER}`, display: 'flex', background: BG }}>
          {[
            { label: 'AIRPORT',       value: 'BASE' },
            { label: 'ICAO',          value: 'APF' },
            { label: 'CITY',          value: 'GENERIC' },
            { label: 'SCENARIO 2031', value: `${lastForecast.passengersM}M`, color: '#fff' },
            { label: 'BASELINE 2031', value: `${lastBaseline.passengersM}M`, color: TEXT },
            { label: 'CAGR',          value: `${forecastCAGR.toFixed(1)}%`, color: forecastCAGR >= 2 ? GREEN : TEXT },
            { label: 'DELTA',         value: `${deltaPaxM > 0 ? '+' : ''}${deltaPaxM}M`, color: deltaPaxM > 0 ? CYAN : RED },
            { label: 'GROWTH X',      value: `×${(lastForecast.passengers / first.passengers).toFixed(2)}` },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 14px', borderRight: `1px solid ${BORDER}`, minWidth: 90 }}>
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: 2, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color || TEXT }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ borderBottom: `1px solid ${alertColor}30`, background: `${alertColor}08`, padding: '5px 20px', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', height: 28 }}>
          <span style={{ color: alertColor, fontSize: 9, fontWeight: 700, letterSpacing: 2, flexShrink: 0 }}>⚠ ALERT</span>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: alertColor, fontSize: 9, letterSpacing: 1.5, animation: 'ticker 30s linear infinite', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {alertMsg} · {alertMsg} · {alertMsg}
            </div>
          </div>
        </div>

        <div style={{ borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center' }}>
          {['PARAMETERS', 'FORECAST', 'HISTORY', 'MODEL'].map((tab, i) => (
            <div key={tab} style={{ padding: '9px 16px', fontSize: 10, letterSpacing: 2, color: i === 0 ? CYAN : MUTED, borderBottom: i === 0 ? `2px solid ${CYAN}` : '2px solid transparent', cursor: 'default' }}>
              {tab}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 9, color: MUTED, letterSpacing: 1, padding: '9px 20px', borderLeft: `1px solid ${BORDER}` }}>
            <span style={{ color: CYAN }}>● LIVE FORECAST</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '16px 20px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionCard title="MACRO ENVIRONMENT" subtitle="DRIVES UNDERLYING TRAVEL DEMAND" accentColor="cyan">
            <SliderControl label="GDP GROWTH (ANNUAL %)" value={params.gdpGrowth} min={-3} max={6} step={0.1} onChange={set('gdpGrowth')} color="cyan" description="Real GDP growth. Elasticity 1.7×." />
            <SliderControl label="TOURISM DEMAND GROWTH (%)" value={params.tourismGrowth} min={-5} max={10} step={0.5} onChange={set('tourismGrowth')} color="cyan" description="Incremental demand beyond GDP." />
            <SliderControl label="FUEL PRICE CHANGE (%)" value={params.fuelPriceChange} min={-30} max={50} step={2.5} onChange={set('fuelPriceChange')} color="cyan" description="Affects airline seat supply." />
          </SectionCard>

          <SectionCard title="MAIN AIRLINE" subtitle="DOMINANT CARRIER STRATEGIC DECISIONS" accentColor="green">
            <SliderControl label="CAPACITY CHANGE (ANNUAL %)" value={params.mainAirlineCapacityChange} min={-15} max={20} step={0.5} onChange={set('mainAirlineCapacityChange')} color="green" description="Seat capacity growth/decline rate." />
            <SliderControl label="NEW ROUTES IMPACT (%)" value={params.newRoutesImpact} min={0} max={25} step={1} onChange={set('newRoutesImpact')} color="green" description="Incremental pax from new routes." />
            <SliderControl label="LCC / NEW ENTRANT BOOST (%)" value={params.lccEntryBoost} min={0} max={20} step={1} onChange={set('lccEntryBoost')} color="green" description="Low-cost carrier entry impact." />
          </SectionCard>

          <SectionCard title="AIRPORT LEVERS" subtitle="WHAT THE AIRPORT CAN CONTROL DIRECTLY" accentColor="purple">
            <SliderControl label="AIRLINE INCENTIVE PROGRAM (%)" value={params.incentiveProgram} min={0} max={15} step={0.5} onChange={set('incentiveProgram')} color="purple" description="Fee discounts, marketing support." />
            <SliderControl label="TERMINAL EXPANSION (%)" value={params.terminalExpansion} min={0} max={40} step={1} onChange={set('terminalExpansion')} color="purple" description="Capacity uplift from new terminal." />
            <SliderControl label="GROUND CONNECTIVITY (%)" value={params.connectivityImprovement} min={0} max={15} step={0.5} onChange={set('connectivityImprovement')} color="purple" description="Rail, metro links expanding catchment." />
          </SectionCard>

          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${MUTED}`, padding: 12, fontSize: 10 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: MUTED, letterSpacing: 2 }}>MODEL PARAMETERS</p>
            <div style={{ color: MUTED, lineHeight: '2', fontSize: 9 }}>
              <div>{'>'} GDP elasticity 1.7×</div>
              <div>{'>'} Fuel elasticity −0.4×</div>
              <div>{'>'} New routes ramp 3 years</div>
              <div>{'>'} LCC entry effective year 2</div>
              <div>{'>'} Multipliers compound on 12.5M</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <MetricCard label="PAX 2031E" value={`${lastForecast.passengersM}M`} delta={deltaPaxM} unit="M" sub="SCENARIO PASSENGERS" />
            <MetricCard label="CAGR 2024–2031" value={`${forecastCAGR.toFixed(1)}%`} delta={forecastCAGR - baselineCAGR} unit="%" sub="COMPOUND ANNUAL GROWTH" />
            <MetricCard label="VS BASELINE 2031" value={`${deltaPaxM >= 0 ? '+' : ''}${deltaPaxM}M`} sub="INCREMENTAL PAX" />
            <MetricCard label="GROWTH MULTIPLE" value={`×${(lastForecast.passengers / first.passengers).toFixed(2)}`} sub={`BASELINE ×${(lastBaseline.passengers / first.passengers).toFixed(2)}`} />
          </div>

          <div style={{ background: SURF, border: `1px solid ${BORDER}`, padding: '14px 16px 10px' }}>
            <div style={{ borderLeft: `3px solid ${CYAN}`, paddingLeft: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>PASSENGER HISTORY & FORECAST 2018–2031</h2>
              <p style={{ margin: '2px 0 0', fontSize: 9, color: MUTED, letterSpacing: 1 }}>ACTUALS (2018–2024) · SCENARIO VS BASELINE (2024–2031)</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#334155" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradHistorical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={AMBER} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={BORDER} />
                <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 9 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 9 }} tickFormatter={v => `${v}M`} />
                <Tooltip content={<HudTooltip />} />
                <ReferenceLine x={2024} stroke={`${CYAN}40`} strokeDasharray="3 2" label={{ value: '◀ ACTUAL  FORECAST ▶', position: 'top', fill: MUTED, fontSize: 9 }} />
                <Area type="monotone" dataKey="historical" stroke={AMBER} strokeWidth={1.5} fill="url(#gradHistorical)" name="historical" connectNulls={false} dot={false} />
                <Area type="monotone" dataKey="baseline" stroke="#334155" strokeWidth={1} strokeDasharray="3 2" fill="url(#gradBaseline)" name="baseline" connectNulls={false} dot={false} />
                <Area type="monotone" dataKey="forecast" stroke={CYAN} strokeWidth={2} fill="url(#gradForecast)" name="forecast" connectNulls={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: SURF, border: `1px solid ${BORDER}`, padding: '14px 16px 10px' }}>
            <div style={{ borderLeft: `3px solid ${AMBER}`, paddingLeft: 10, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>DRIVER CONTRIBUTIONS</h2>
              <p style={{ margin: '2px 0 0', fontSize: 9, color: MUTED, letterSpacing: 1 }}>CUMULATIVE % UPLIFT ABOVE 2024 BASE</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={contribData}>
                <CartesianGrid strokeDasharray="2 4" stroke={BORDER} />
                <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 9 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 9 }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<HudTooltip />} />
                <ReferenceLine y={0} stroke={BORDER} />
                <Line type="monotone" dataKey="MACRO" stroke={CYAN} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="AIRLINE" stroke={GREEN} strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="AIRPORT" stroke={ACCENT_MAP.purple} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: SURF, border: `1px solid ${BORDER}` }}>
            <div style={{ borderBottom: `1px solid ${BORDER}`, borderLeft: `3px solid ${ACCENT_MAP.purple}`, padding: '10px 14px' }}>
              <h2 style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>YEAR-BY-YEAR DATA</h2>
              <p style={{ margin: '2px 0 0', fontSize: 9, color: MUTED, letterSpacing: 1 }}>HISTORICAL ACTUALS + FORECAST · SCENARIO VS BASELINE</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse', fontFamily: 'inherit' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: '#040d12' }}>
                    {['#', 'YEAR', 'TYPE', 'SCENARIO', 'BASELINE', 'DELTA', 'YoY', 'RISK'].map(h => (
                      <th key={h} style={{ textAlign: h === '#' || h === 'TYPE' || h === 'RISK' ? 'center' : 'right', padding: '6px 10px', color: MUTED, fontSize: 8, letterSpacing: 1.5, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORICAL_DATA.map((h, i) => {
                    const prevM = i === 0 ? null : HISTORICAL_DATA[i - 1].passengersM;
                    const yoy   = prevM ? ((h.passengersM / prevM - 1) * 100) : null;
                    const risk  = yoy !== null ? riskBadge(yoy) : null;
                    return (
                      <tr key={h.year} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : `${CYAN}04`, opacity: 0.8 }}>
                        <td style={{ textAlign: 'center', padding: '5px 10px', color: MUTED, fontSize: 8 }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ padding: '5px 10px', color: AMBER, fontWeight: 700 }}>{h.year}</td>
                        <td style={{ textAlign: 'center', padding: '5px 10px' }}><span style={{ fontSize: 8, color: AMBER, border: `1px solid ${AMBER}50`, background: `${AMBER}10`, padding: '1px 5px', letterSpacing: 1 }}>ACTUAL</span></td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: AMBER }}>{h.passengersM}M</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: MUTED }}>—</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: MUTED }}>—</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: yoy > 0 ? GREEN : RED }}>{yoy ? `${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}%` : '—'}</td>
                        <td style={{ textAlign: 'center', padding: '5px 10px' }}>{risk ? <span style={{ fontSize: 8, color: risk.color, border: `1px solid ${risk.border}`, background: risk.bg, padding: '1px 5px', letterSpacing: 1 }}>{risk.label}</span> : '—'}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: `${CYAN}08`, borderBottom: `1px dashed ${CYAN}40` }}>
                    <td colSpan={8} style={{ padding: '4px 10px', fontSize: 8, color: CYAN, letterSpacing: 2 }}>▼ FORECAST PERIOD</td>
                  </tr>
                  {forecast.map((f, i) => {
                    const b      = baseline[i];
                    const delta  = parseFloat((f.passengersM - b.passengersM).toFixed(2));
                    const prevPax = i === 0 ? HISTORICAL_DATA[HISTORICAL_DATA.length - 1].passengersM * 1_000_000 : forecast[i - 1].passengers;
                    const yoy    = ((f.passengers / prevPax - 1) * 100);
                    const risk   = riskBadge(yoy);
                    return (
                      <tr key={f.year} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : `${CYAN}04` }}>
                        <td style={{ textAlign: 'center', padding: '5px 10px', color: MUTED, fontSize: 8 }}>{String(HISTORICAL_DATA.length + 1 + i).padStart(2, '0')}</td>
                        <td style={{ padding: '5px 10px', color: CYAN, fontWeight: 700 }}>{f.year}{i === 0 ? '' : 'E'}</td>
                        <td style={{ textAlign: 'center', padding: '5px 10px' }}><span style={{ fontSize: 8, color: CYAN, border: `1px solid ${CYAN}50`, background: `${CYAN}10`, padding: '1px 5px', letterSpacing: 1 }}>{i === 0 ? 'BASE' : 'FCST'}</span></td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: '#fff', fontWeight: 700 }}>{f.passengersM}M</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: MUTED }}>{b.passengersM}M</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: delta > 0 ? CYAN : delta < 0 ? RED : MUTED }}>{delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}M`}</td>
                        <td style={{ textAlign: 'right', padding: '5px 10px', color: yoy > 0 ? GREEN : RED }}>{`${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}%`}</td>
                        <td style={{ textAlign: 'center', padding: '5px 10px' }}><span style={{ fontSize: 8, color: risk.color, border: `1px solid ${risk.border}`, background: risk.bg, padding: '1px 5px', letterSpacing: 1 }}>{risk.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
