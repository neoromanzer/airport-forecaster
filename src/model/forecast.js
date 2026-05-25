/**
 * Airport Passenger Forecast Model
 *
 * Formula:  passengers(t) = BASE_PASSENGERS
 *                         × macroMultiplier(t)
 *                         × airlineMultiplier(t)
 *                         × airportMultiplier(t)
 *
 * All three multipliers compound independently year-over-year from the 2024 base.
 * Each one starts at 1.0 (no effect) and grows or shrinks based on slider inputs.
 */

const BASE_YEAR       = 2024;
const BASE_PASSENGERS = 12_500_000; // 12.5M — generic mid-size international airport baseline

// GDP elasticity: 1% GDP growth → ~1.7% passenger growth.
// Academic range is 1.5–2.0×; 1.7 is a widely-used mid-point for mature markets.
const GDP_ELASTICITY  =  1.7;

// Fuel elasticity: 10% fuel price rise → ~4% passenger drop.
// Negative because higher fuel costs push airlines to cut capacity.
const FUEL_ELASTICITY = -0.4;


// ─── Multiplier functions ──────────────────────────────────────────────────────

// Macro factors are entirely outside the airport's control.
// They compound smoothly from year 0 (2024) to year N.
function macroMultiplier(yearOffset, params) {
  const { gdpGrowth, tourismGrowth, fuelPriceChange } = params;

  const gdpEffect      = Math.pow(1 + (gdpGrowth      / 100) * GDP_ELASTICITY,  yearOffset);
  const tourismEffect  = Math.pow(1 + (tourismGrowth  / 100),                   yearOffset);
  const fuelEffect     = Math.pow(1 + (fuelPriceChange / 100) * FUEL_ELASTICITY, yearOffset);

  return gdpEffect * tourismEffect * fuelEffect;
}

// Airline decisions — the dominant carrier's capacity and network choices.
// New routes and LCC entry are treated as one-time structural shifts, not annual compounders,
// because a route launched in year 1 doesn't keep adding the same uplift every subsequent year.
function airlineMultiplier(yearOffset, params) {
  const { mainAirlineCapacityChange, newRoutesImpact, lccEntryBoost } = params;

  // Capacity change compounds annually (e.g. fleet growth).
  const capacityEffect = Math.pow(1 + mainAirlineCapacityChange / 100, yearOffset);

  // New routes ramp in over 3 years then stabilise — airlines need time to build load factors.
  const newRoutesEffect = yearOffset >= 1 && newRoutesImpact > 0
    ? 1 + (newRoutesImpact / 100) * Math.min(yearOffset, 3) / 3
    : 1;

  // LCC entry is delayed to year 2 (regulatory approval, slot allocation, marketing lead time).
  const lccEffect = yearOffset >= 2 && lccEntryBoost > 0
    ? 1 + lccEntryBoost / 100
    : 1;

  return capacityEffect * newRoutesEffect * lccEffect;
}

// Airport levers — what the airport itself can action.
// All three have a minimum delay before taking effect; infrastructure takes time to build
// and incentive programmes need an airline planning cycle to translate into flights.
function airportMultiplier(yearOffset, params) {
  const { incentiveProgram, terminalExpansion, connectivityImprovement } = params;

  // Incentive programme (fee waivers, route development funds): effective from year 1,
  // ramps to full impact over 2 years as airlines adjust schedules.
  const incentiveEffect = yearOffset >= 1 && incentiveProgram > 0
    ? 1 + (incentiveProgram / 100) * Math.min(yearOffset, 2) / 2
    : 1;

  // Terminal expansion: capacity only unlocked from year 2 (construction lead time).
  const terminalEffect = yearOffset >= 2 && terminalExpansion > 0
    ? 1 + terminalExpansion / 100
    : 1;

  // Ground connectivity (rail, metro link): widens the catchment area from year 1.
  const connectivityEffect = yearOffset >= 1 && connectivityImprovement > 0
    ? 1 + connectivityImprovement / 100
    : 1;

  return incentiveEffect * terminalEffect * connectivityEffect;
}


// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a scenario forecast series from 2024 to 2024+years.
 *
 * Returns one data point per year. Index 0 is always the 2024 base year
 * (all multipliers = 1.0), which anchors the chart and the table's BASE row.
 *
 * Each point exposes the three raw multipliers (macroContrib, airlineContrib,
 * airportContrib) so the driver contributions chart can show them separately.
 */
export function generateForecast(params, years = 7) {
  const data = [];

  for (let i = 0; i <= years; i++) {
    const year    = BASE_YEAR + i;
    const macro   = macroMultiplier(i, params);
    const airline = airlineMultiplier(i, params);
    const airport = airportMultiplier(i, params);
    const total   = Math.round(BASE_PASSENGERS * macro * airline * airport);

    data.push({
      year,
      passengers:     total,
      passengersM:    +(total / 1_000_000).toFixed(2),
      macroContrib:   macro,
      airlineContrib: airline,
      airportContrib: airport,
    });
  }

  return data;
}

/**
 * Baseline forecast — assumes 2% GDP growth and no other changes.
 * Used as the comparison line on charts and the DELTA column in the table.
 */
export function generateBaseline(years = 7) {
  return generateForecast({
    gdpGrowth:                2.0,
    tourismGrowth:            0,
    fuelPriceChange:          0,
    mainAirlineCapacityChange: 0,
    newRoutesImpact:          0,
    lccEntryBoost:            0,
    incentiveProgram:         0,
    terminalExpansion:        0,
    connectivityImprovement:  0,
  }, years);
}

export const BASE_PAX      = BASE_PASSENGERS;
export const FORECAST_START = BASE_YEAR;
