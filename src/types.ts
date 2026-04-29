export type Asset = {
  id: string;
  name: string;
  allocation: number;
  expectedReturn: number;
  color?: string;
};

export type PlannerInputs = {
  initialCapital: number;
  currentAge: number;
  emergencyFund: number;
  assets: Asset[];
  monthlyContribution: number;
  contributionGrowth: number;
  inflation: number;
  horizonYears: number;
  withdrawalRate: number;
};

export type YearProjection = {
  year: number;
  age: number;
  assetValues: Record<string, number>;
  totalNominal: number;
  totalPresentValue: number;
  contributedThisYear: number;
  totalContributed: number;
  cumulativeGain: number;
  interestThisYear: number;
  yearGrowthPct: number;
};

export type WithdrawalScenario = {
  rate: number;
  annualNominal: number;
  monthlyNominal: number;
  annualPV: number;
  monthlyPV: number;
  label: 'seguro' | 'estándar' | 'agresivo';
};

export type StoredState = {
  version: number;
  inputs: PlannerInputs;
};
