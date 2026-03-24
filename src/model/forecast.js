/**
 * Airport Passenger Forecast Model
 *
 * Base formula:
 *   passengers(t) = base * macro_multiplier(t) * airline_multiplier(t) * airport_multiplier(t)
 *
 * All multipliers compound year-over-year.
 */

const BASE_YEAR = 2024;
const BASE_PASSENGERS = 12_500_000; // 12.5M baseline passengers

/**
 * GDP elasticity of air travel demand is typically 1.5–2.0x
 * (1% GDP growth → ~1.5–2% passenger growth)
 */
const GDP_ELASTICITY = 1.7;

/**
 * Fuel price impact: higher fuel → airlines cut routes → fewer passengers
 * Elasticity is around -0.4 (10% fuel rise → ~4% passenger drop)
 */
const FUEL_ELASTICITY = -0.4;

/**
 * Compute macro multiplier for a given year offset
 */
function macroMultiplier(yearOffset, params) {
  const { gdpGrowth, tourismGrowth, fuelPriceChange } = params;

  // GDP drives underlying travel demand
  const gdpEffect = Math.pow(1 + (gdpGrowth / 100) * GDP_ELASTICITY, yearOffset);

  // Tourism index adds on top of GDP
  const tourismEffect = Math.pow(1 + tourismGrowth / 100, yearOffset);

  // Fuel prices affect airline profitability → capacity
  const fuelEffect = Math.pow(1 + (fuelPriceChange / 100) * FUEL_ELASTICITY, yearOffset);

  return gdpEffect * tourismEffect * fuelEffect;
}

/**
 * Airline multiplier: reflects decisions of dominant carrier(s)
 */
function airlineMultiplier(yearOffset, params) {
  const { mainAirlineCapacityChange, newRoutesImpact, lccEntryBoost } = params;

  // Main airline capacity change per year
  const capacityEffect = Math.pow(1 + mainAirlineCapacityChange / 100, yearOffset);

  // New routes: one-time step-change in year 1 if enabled
  const newRoutesEffect = yearOffset >= 1 && newRoutesImpact > 0
    ? 1 + (newRoutesImpact / 100) * Math.min(yearOffset, 3) / 3  // ramps over 3 years
    : 1;

  // LCC entry boost: one-time uplift starting year 2 if enabled
  const lccEffect = yearOffset >= 2 && lccEntryBoost > 0
    ? 1 + lccEntryBoost / 100
    : 1;

  return capacityEffect * newRoutesEffect * lccEffect;
}

/**
 * Airport multiplier: reflects airport's own levers
 */
function airportMultiplier(yearOffset, params) {
  const { incentiveProgram, terminalExpansion, connectivityImprovement } = params;

  // Incentive program (fee discounts, marketing support): attracts airlines → +pax
  const incentiveEffect = yearOffset >= 1 && incentiveProgram > 0
    ? 1 + (incentiveProgram / 100) * Math.min(yearOffset, 2) / 2
    : 1;

  // Terminal expansion: capacity unlocked from year 2
  const terminalEffect = yearOffset >= 2 && terminalExpansion > 0
    ? 1 + terminalExpansion / 100
    : 1;

  // Ground connectivity (rail, metro): increases catchment area
  const connectivityEffect = yearOffset >= 1 && connectivityImprovement > 0
    ? 1 + connectivityImprovement / 100
    : 1;

  return incentiveEffect * terminalEffect * connectivityEffect;
}

/**
 * Generate a forecast series for N years
 */
export function generateForecast(params, years = 7) {
  const data = [];

  for (let i = 0; i <= years; i++) {
    const year = BASE_YEAR + i;
    const macro = macroMultiplier(i, params);
    const airline = airlineMultiplier(i, params);
    const airport = airportMultiplier(i, params);
    const total = Math.round(BASE_PASSENGERS * macro * airline * airport);

    data.push({
      year,
      passengers: total,
      passengersM: +(total / 1_000_000).toFixed(2),
      macroContrib: macro,
      airlineContrib: airline,
      airportContrib: airport,
    });
  }

  return data;
}

/**
 * Generate a baseline (no changes) for comparison
 */
export function generateBaseline(years = 7) {
  return generateForecast({
    gdpGrowth: 2.0,
    tourismGrowth: 0,
    fuelPriceChange: 0,
    mainAirlineCapacityChange: 0,
    newRoutesImpact: 0,
    lccEntryBoost: 0,
    incentiveProgram: 0,
    terminalExpansion: 0,
    connectivityImprovement: 0,
  }, years);
}

export const BASE_PAX = BASE_PASSENGERS;
export const FORECAST_START = BASE_YEAR;
