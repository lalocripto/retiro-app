import type { PlannerInputs } from './types';

export const STORAGE_KEY = 'retirement-planner-state';
export const SCHEMA_VERSION = 1;

export const ASSET_PALETTE = [
  '#c9a961',
  '#60a5fa',
  '#a78bfa',
  '#34d399',
  '#fb7185',
  '#fbbf24',
  '#22d3ee',
  '#f472b6',
];

export const DEFAULT_INPUTS: PlannerInputs = {
  initialCapital: 200000,
  currentAge: 30,
  emergencyFund: 30000,
  assets: [
    { id: 'btc', name: 'Bitcoin', allocation: 50, expectedReturn: 15, color: '#c9a961' },
    { id: 'sp500', name: 'S&P 500', allocation: 50, expectedReturn: 10, color: '#60a5fa' },
  ],
  monthlyContribution: 2000,
  contributionGrowth: 3,
  inflation: 3,
  horizonYears: 15,
  withdrawalRate: 4,
};

export const WITHDRAWAL_RATES: Array<{ rate: number; label: 'seguro' | 'estándar' | 'agresivo' }> = [
  { rate: 3.5, label: 'seguro' },
  { rate: 4.0, label: 'estándar' },
  { rate: 5.0, label: 'agresivo' },
];
