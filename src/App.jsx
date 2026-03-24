import { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

import { generateForecast, generateBaseline } from './model/forecast';
import SliderControl from './components/SliderControl';
import SectionCard from './components/SectionCard';
import MetricCard from './components/MetricCard';
import './index.css';

const DEFAULT_PARAMS = {
  // Macro
  gdpGrowth: 2.0,
  tourismGrowth: 1.0,
  fuelPriceChange: 0,

  // Airline
  mainAirlineCapacityChange: 0,
  newRoutesImpact: 0,
  lccEntryBoost: 0,

  // Airport
  incentiveProgram: 0,
  terminalExpansion: 0,
  connectivityImprovement: 0,
};

const FORECAST_YEARS = 7;

function cagr(start, end, years) {
  return (((end / start) ** (1 / years)) - 1) * 100;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ fontWeight: 'bold', color: '#f1f5f9', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{p.name === 'forecast' ? 'Scenario' : 'Baseline'}</span>
          <span style={{ color: '#fff', fontFamily: 'monospace' }}>{p.value?.toFixed(2)}M pax</span>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);

  const set = (key) => (val) => setParams(p => ({ ...p, [key]: val }));

  const forecast = useMemo(() => generateForecast(params, FORECAST_YEARS), [params]);
  const baseline = useMemo(() => generateBaseline(FORECAST_YEARS), []);

  const chartData = forecast.map((f, i) => ({
    year: f.year,
    forecast: f.passengersM,
    baseline: baseline[i].passengersM,
  }));

  const lastForecast = forecast[forecast.length - 1];
  const lastBaseline = baseline[baseline.length - 1];
  const first = forecast[0];

  const forecastCAGR = cagr(first.passengers, lastForecast.passengers, FORECAST_YEARS);
  const baselineCAGR = cagr(first.passengers, lastBaseline.passengers, FORECAST_YEARS);
  const deltaPaxM = parseFloat((lastForecast.passengersM - lastBaseline.passengersM).toFixed(2));
  const deltaCAGR = parseFloat((forecastCAGR - baselineCAGR).toFixed(2));

  const contribData = forecast.slice(1).map(f => ({
    year: f.year,
    Macro: +((f.macroContrib - 1) * 100).toFixed(1),
    Airline: +((f.airlineContrib - 1) * 100).toFixed(1),
    Airport: +((f.airportContrib - 1) * 100).toFixed(1),
  }));

  const hasChanges = JSON.stringify(params) !== JSON.stringify(DEFAULT_PARAMS);

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e293b', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>✈️</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>Airport Passenger Forecaster</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Parametric demand model · Base: 12.5M pax (2024) · Horizon: 2031</p>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={() => setParams(DEFAULT_PARAMS)}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer' }}
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>

        {/* ─── Left: Controls ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <SectionCard title="Macro Environment" subtitle="Drives underlying travel demand" icon="🌍" accentColor="blue">
            <SliderControl
              label="GDP Growth (annual %)"
              value={params.gdpGrowth}
              min={-3} max={6} step={0.1}
              onChange={set('gdpGrowth')}
              color="blue"
              description="Real GDP growth. Elasticity 1.7× on air travel demand."
            />
            <SliderControl
              label="Tourism Demand Growth (%)"
              value={params.tourismGrowth}
              min={-5} max={10} step={0.5}
              onChange={set('tourismGrowth')}
              color="blue"
              description="Incremental demand beyond GDP — visa liberalisation, marketing, events."
            />
            <SliderControl
              label="Fuel Price Change (%)"
              value={params.fuelPriceChange}
              min={-30} max={50} step={2.5}
              onChange={set('fuelPriceChange')}
              color="blue"
              description="Affects airline seat supply. Elasticity −0.4× (capacity shrinks when fuel spikes)."
            />
          </SectionCard>

          <SectionCard title="Main Airline" subtitle="Dominant carrier strategic decisions" icon="🛫" accentColor="green">
            <SliderControl
              label="Capacity Change (annual %)"
              value={params.mainAirlineCapacityChange}
              min={-15} max={20} step={0.5}
              onChange={set('mainAirlineCapacityChange')}
              color="green"
              description="Seat capacity growth/decline rate of the dominant carrier year-on-year."
            />
            <SliderControl
              label="New Routes Impact (%)"
              value={params.newRoutesImpact}
              min={0} max={25} step={1}
              unit="%"
              onChange={set('newRoutesImpact')}
              color="green"
              description="Incremental pax from new long-haul or international routes — ramps over 3 years."
            />
            <SliderControl
              label="LCC / New Entrant Boost (%)"
              value={params.lccEntryBoost}
              min={0} max={20} step={1}
              unit="%"
              onChange={set('lccEntryBoost')}
              color="green"
              description="Low-cost carrier or new airline entry. Stimulates demand from year 2."
            />
          </SectionCard>

          <SectionCard title="Airport Levers" subtitle="What the airport can control directly" icon="🏗️" accentColor="purple">
            <SliderControl
              label="Airline Incentive Program (%)"
              value={params.incentiveProgram}
              min={0} max={15} step={0.5}
              unit="%"
              onChange={set('incentiveProgram')}
              color="purple"
              description="Fee discounts, marketing co-funding to attract airlines. Ramps over 2 years."
            />
            <SliderControl
              label="Terminal Expansion (%)"
              value={params.terminalExpansion}
              min={0} max={40} step={1}
              unit="%"
              onChange={set('terminalExpansion')}
              color="purple"
              description="Capacity uplift from new terminal or additional gates. Available from year 2."
            />
            <SliderControl
              label="Ground Connectivity (%)"
              value={params.connectivityImprovement}
              min={0} max={15} step={0.5}
              unit="%"
              onChange={set('connectivityImprovement')}
              color="purple"
              description="Rail, metro or road links expanding the catchment area. Effect from year 1."
            />
          </SectionCard>

          {/* Model notes */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 16, fontSize: 11, color: '#475569' }}>
            <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Model assumptions</p>
            <ul style={{ margin: 0, paddingLeft: 16, lineHeight: '1.7' }}>
              <li>GDP elasticity 1.7× (IATA average for mature markets)</li>
              <li>Fuel elasticity −0.4× on airline seat supply</li>
              <li>New routes ramp linearly over 3 years</li>
              <li>LCC entry & incentive programs effective from year 2</li>
              <li>Terminal expansion unlocks from year 2</li>
              <li>Multipliers compound independently on 12.5M base</li>
            </ul>
          </div>
        </div>

        {/* ─── Right: Charts & KPIs ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <MetricCard label={`Pax ${lastForecast.year}E`} value={`${lastForecast.passengersM}M`} delta={deltaPaxM} unit="M" sub="scenario passengers" />
            <MetricCard label="CAGR 2024–2031" value={`${forecastCAGR.toFixed(1)}%`} delta={deltaCAGR} unit="%" sub="compound annual growth" />
            <MetricCard label="vs Baseline 2031" value={`${deltaPaxM >= 0 ? '+' : ''}${deltaPaxM}M`} sub="incremental passengers" />
            <MetricCard label="Growth multiple" value={`×${(lastForecast.passengers / first.passengers).toFixed(2)}`} sub={`baseline ×${(lastBaseline.passengers / first.passengers).toFixed(2)}`} />
          </div>

          {/* Area chart */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 20px 12px' }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>Passenger Forecast 2024–2031</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>Million passengers per year — scenario vs baseline</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={v => `${v}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val === 'forecast' ? 'Scenario' : 'Baseline'}</span>}
                />
                <Area type="monotone" dataKey="baseline" stroke="#475569" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gradBaseline)" name="baseline" />
                <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradForecast)" name="forecast" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Driver contribution chart */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 20px 12px' }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>Driver Contributions</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>Cumulative % uplift above 2024 base, broken out by driver</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={contribData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 12 }} tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                  formatter={(v, name) => [`${v > 0 ? '+' : ''}${v}%`, name]}
                />
                <ReferenceLine y={0} stroke="#334155" />
                <Legend formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val}</span>} />
                <Line type="monotone" dataKey="Macro" stroke="#60a5fa" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Airline" stroke="#34d399" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Airport" stroke="#a78bfa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Year-by-year table */}
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>Year-by-Year Forecast</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <th style={{ textAlign: 'left', padding: '8px 16px 8px 0', color: '#475569' }}>Year</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: '#60a5fa' }}>Scenario</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: '#475569' }}>Baseline</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', color: '#475569' }}>Delta</th>
                    <th style={{ textAlign: 'right', padding: '8px 0 8px 12px', color: '#475569' }}>YoY growth</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((f, i) => {
                    const b = baseline[i];
                    const delta = parseFloat((f.passengersM - b.passengersM).toFixed(2));
                    const yoy = i === 0 ? null : ((f.passengers / forecast[i - 1].passengers - 1) * 100);
                    return (
                      <tr key={f.year} style={{ borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
                        <td style={{ padding: '8px 16px 8px 0', color: '#cbd5e1', fontWeight: 500 }}>
                          {f.year}{i === 0 ? ' (base)' : 'E'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 12px', color: '#fff', fontFamily: 'monospace' }}>{f.passengersM}M</td>
                        <td style={{ textAlign: 'right', padding: '8px 12px', color: '#64748b', fontFamily: 'monospace' }}>{b.passengersM}M</td>
                        <td style={{ textAlign: 'right', padding: '8px 12px', fontFamily: 'monospace', color: delta > 0 ? '#34d399' : delta < 0 ? '#f87171' : '#475569' }}>
                          {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}M`}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px 0 8px 12px', fontFamily: 'monospace', color: yoy === null ? '#475569' : yoy > 0 ? '#34d399' : '#f87171' }}>
                          {yoy === null ? '—' : `${yoy > 0 ? '+' : ''}${yoy.toFixed(1)}%`}
                        </td>
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
