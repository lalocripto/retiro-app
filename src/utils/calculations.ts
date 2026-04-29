import type { PlannerInputs, YearProjection, WithdrawalScenario } from '../types';
import { WITHDRAWAL_RATES } from '../constants';

export function totalAllocation(inputs: PlannerInputs): number {
  return inputs.assets.reduce((sum, a) => sum + a.allocation, 0);
}

export function isAllocationValid(inputs: PlannerInputs): boolean {
  return Math.abs(totalAllocation(inputs) - 100) < 0.01;
}

export function projectPortfolio(inputs: PlannerInputs): YearProjection[] {
  const { initialCapital, currentAge, assets, monthlyContribution, contributionGrowth, inflation, horizonYears } = inputs;

  const balances: Record<string, number> = {};
  for (const a of assets) {
    balances[a.id] = (initialCapital * a.allocation) / 100;
  }

  const projections: YearProjection[] = [];

  // Year 0 snapshot
  projections.push({
    year: 0,
    age: currentAge,
    assetValues: { ...balances },
    totalNominal: sumValues(balances),
    totalPresentValue: sumValues(balances),
    contributedThisYear: 0,
    totalContributed: 0,
    cumulativeGain: 0,
    yearGrowthPct: 0,
  });

  let currentMonthly = monthlyContribution;
  let totalContributed = 0;

  for (let year = 1; year <= horizonYears; year++) {
    const startTotal = sumValues(balances);
    let contributedThisYear = 0;

    for (let month = 0; month < 12; month++) {
      // Apply monthly growth per asset
      for (const a of assets) {
        const monthlyRate = Math.pow(1 + a.expectedReturn / 100, 1 / 12) - 1;
        balances[a.id] = (balances[a.id] ?? 0) * (1 + monthlyRate);
      }
      // Distribute contribution proportional to allocation
      for (const a of assets) {
        const portion = currentMonthly * (a.allocation / 100);
        balances[a.id] = (balances[a.id] ?? 0) + portion;
      }
      contributedThisYear += currentMonthly;
    }

    totalContributed += contributedThisYear;
    const totalNominal = sumValues(balances);
    const totalPresentValue = totalNominal / Math.pow(1 + inflation / 100, year);
    const cumulativeGain = totalNominal - totalContributed - initialCapital;
    const yearGrowthPct = startTotal > 0 ? ((totalNominal - startTotal - contributedThisYear) / startTotal) * 100 : 0;

    projections.push({
      year,
      age: currentAge + year,
      assetValues: { ...balances },
      totalNominal,
      totalPresentValue,
      contributedThisYear,
      totalContributed,
      cumulativeGain,
      yearGrowthPct,
    });

    currentMonthly *= 1 + contributionGrowth / 100;
  }

  return projections;
}

export function withdrawalScenarios(
  finalNominal: number,
  inflation: number,
  horizon: number,
  rates: typeof WITHDRAWAL_RATES = WITHDRAWAL_RATES,
): WithdrawalScenario[] {
  const inflationFactor = Math.pow(1 + inflation / 100, horizon);
  return rates.map(({ rate, label }) => {
    const annualNominal = finalNominal * (rate / 100);
    const annualPV = annualNominal / inflationFactor;
    return {
      rate,
      annualNominal,
      monthlyNominal: annualNominal / 12,
      annualPV,
      monthlyPV: annualPV / 12,
      label,
    };
  });
}

export function rebalanceAllocations(allocations: number[]): number[] {
  const total = allocations.reduce((s, n) => s + n, 0);
  if (total === 0) {
    const equal = 100 / allocations.length;
    return allocations.map(() => roundTo(equal, 2));
  }
  const scaled = allocations.map((n) => (n / total) * 100);
  // Round to 2 decimals while preserving sum at 100
  const rounded = scaled.map((n) => roundTo(n, 2));
  const drift = roundTo(100 - rounded.reduce((s, n) => s + n, 0), 2);
  if (drift !== 0 && rounded.length > 0) {
    rounded[0] = roundTo(rounded[0] + drift, 2);
  }
  return rounded;
}

function sumValues(map: Record<string, number>): number {
  let s = 0;
  for (const k in map) s += map[k];
  return s;
}

function roundTo(n: number, digits: number): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}
