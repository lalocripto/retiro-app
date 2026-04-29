import { describe, it, expect } from 'vitest';
import { projectPortfolio, withdrawalScenarios, rebalanceAllocations, isAllocationValid } from './calculations';
import type { PlannerInputs } from '../types';

const baseInputs: PlannerInputs = {
  initialCapital: 100000,
  currentAge: 30,
  emergencyFund: 0,
  assets: [
    { id: 'a', name: 'A', allocation: 100, expectedReturn: 0 },
  ],
  monthlyContribution: 0,
  contributionGrowth: 0,
  inflation: 0,
  horizonYears: 5,
  withdrawalRate: 4,
};

describe('projectPortfolio', () => {
  it('keeps balance constant with no contributions and 0% return', () => {
    const out = projectPortfolio(baseInputs);
    expect(out).toHaveLength(6);
    out.forEach((p) => {
      expect(p.totalNominal).toBeCloseTo(100000, 4);
    });
  });

  it('compounds monthly correctly for 10% annual return over 1 year', () => {
    const inputs: PlannerInputs = {
      ...baseInputs,
      assets: [{ id: 'a', name: 'A', allocation: 100, expectedReturn: 10 }],
      horizonYears: 1,
    };
    const out = projectPortfolio(inputs);
    // Monthly compounding of (1+0.10)^(1/12) over 12 months = exactly 1.10
    expect(out[1].totalNominal).toBeCloseTo(110000, 1);
  });

  it('applies inflation discounting to present value', () => {
    const inputs: PlannerInputs = {
      ...baseInputs,
      inflation: 5,
      horizonYears: 10,
    };
    const out = projectPortfolio(inputs);
    const final = out[10];
    const expectedPV = final.totalNominal / Math.pow(1.05, 10);
    expect(final.totalPresentValue).toBeCloseTo(expectedPV, 2);
  });

  it('distributes contributions across assets by allocation', () => {
    const inputs: PlannerInputs = {
      ...baseInputs,
      assets: [
        { id: 'a', name: 'A', allocation: 60, expectedReturn: 0 },
        { id: 'b', name: 'B', allocation: 40, expectedReturn: 0 },
      ],
      monthlyContribution: 1000,
      horizonYears: 1,
    };
    const out = projectPortfolio(inputs);
    const final = out[1];
    // 12 * 1000 = 12000 contributed; 60% to A (60000 + 7200), 40% to B (40000 + 4800)
    expect(final.assetValues['a']).toBeCloseTo(67200, 1);
    expect(final.assetValues['b']).toBeCloseTo(44800, 1);
    expect(final.totalNominal).toBeCloseTo(112000, 1);
  });

  it('grows annual contribution by configured rate', () => {
    const inputs: PlannerInputs = {
      ...baseInputs,
      monthlyContribution: 100,
      contributionGrowth: 10,
      horizonYears: 2,
    };
    const out = projectPortfolio(inputs);
    expect(out[1].contributedThisYear).toBeCloseTo(1200, 4);
    // Year 2: 100 * 1.10 = 110/mo * 12 = 1320
    expect(out[2].contributedThisYear).toBeCloseTo(1320, 4);
  });
});

describe('withdrawalScenarios', () => {
  it('computes 4% of 1M as 40k annual nominal', () => {
    const out = withdrawalScenarios(1_000_000, 0, 10);
    const four = out.find((s) => s.rate === 4)!;
    expect(four.annualNominal).toBeCloseTo(40000, 4);
    expect(four.annualPV).toBeCloseTo(40000, 4);
    expect(four.monthlyPV).toBeCloseTo(40000 / 12, 4);
  });

  it('discounts present value by inflation over horizon', () => {
    const out = withdrawalScenarios(1_000_000, 3, 20);
    const four = out.find((s) => s.rate === 4)!;
    const expectedPV = 40000 / Math.pow(1.03, 20);
    expect(four.annualPV).toBeCloseTo(expectedPV, 2);
  });
});

describe('rebalanceAllocations', () => {
  it('scales values to sum 100', () => {
    const out = rebalanceAllocations([60, 60]);
    expect(out.reduce((s, n) => s + n, 0)).toBeCloseTo(100, 2);
  });

  it('returns equal split when all zero', () => {
    const out = rebalanceAllocations([0, 0, 0, 0]);
    expect(out).toEqual([25, 25, 25, 25]);
  });
});

describe('isAllocationValid', () => {
  it('passes when assets sum to exactly 100', () => {
    expect(isAllocationValid({ ...baseInputs, assets: [
      { id: 'a', name: 'A', allocation: 70, expectedReturn: 0 },
      { id: 'b', name: 'B', allocation: 30, expectedReturn: 0 },
    ]})).toBe(true);
  });

  it('fails when sum is off', () => {
    expect(isAllocationValid({ ...baseInputs, assets: [
      { id: 'a', name: 'A', allocation: 70, expectedReturn: 0 },
      { id: 'b', name: 'B', allocation: 40, expectedReturn: 0 },
    ]})).toBe(false);
  });
});
