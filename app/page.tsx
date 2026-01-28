'use client';

import { useMemo, useState } from 'react';
import { LoanForm } from '@/components/LoanForm';
import { LoanChart } from '@/components/LoanChart';
import { SummaryPanel } from '@/components/SummaryPanel';
import {
  LoanFormValues,
  LoanMetrics,
  calculateLoanMetrics,
} from '@/utils/calculateLoanMetrics';

const buildDefaultValues = (): LoanFormValues => ({
  tuition: 15000,
  livingExpenses: 8000,
  interestRate: 5.5,
  loanTermYears: 10,
  gracePeriodMonths: 6,
  startDate: new Date().toISOString().split('T')[0],
  currency: 'USD',
  partTimeIncome: 250,
  earlyRepaymentRate: 0.1,
  interestType: 'compound',
});

export default function Home() {
  const [formValues, setFormValues] = useState<LoanFormValues>(buildDefaultValues());
  const [metrics, setMetrics] = useState<LoanMetrics | undefined>(undefined);
  const [errors, setErrors] = useState<Partial<Record<keyof LoanFormValues, string>>>({});

  const totalPrincipal = useMemo(
    () => Math.max(0, formValues.tuition) + Math.max(0, formValues.livingExpenses),
    [formValues.livingExpenses, formValues.tuition]
  );

  const validate = (values: LoanFormValues) => {
    const fieldErrors: Partial<Record<keyof LoanFormValues, string>> = {};

    if (values.tuition <= 0) fieldErrors.tuition = 'Enter a tuition amount greater than 0.';
    if (values.livingExpenses < 0) fieldErrors.livingExpenses = 'Living expenses cannot be negative.';
    if (values.interestRate < 0) fieldErrors.interestRate = 'Interest rate cannot be negative.';
    if (values.loanTermYears <= 0) fieldErrors.loanTermYears = 'Loan term should be at least 0.5 years.';
    if (values.gracePeriodMonths < 0) fieldErrors.gracePeriodMonths = 'Grace period cannot be negative.';
    if (!values.startDate) fieldErrors.startDate = 'Please choose when your repayments start.';
    if (totalPrincipal <= 0) fieldErrors.tuition = 'Provide tuition and living expenses before calculating.';

    return fieldErrors;
  };

  const handleChange = (field: keyof LoanFormValues, value: number | string) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleCalculate = () => {
    const validation = validate(formValues);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setMetrics(undefined);
      return;
    }

    const result = calculateLoanMetrics(formValues);
    setMetrics(result);
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:py-16">
      <header className="flex flex-col gap-3 text-center md:text-left">
        <div className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-slate-800/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
          Student Loan Calculator
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
          Project your loan costs as an international student.
        </h1>
        <p className="text-slate-300 max-w-3xl">
          Model tuition, living expenses, grace periods, and repayment strategies. Toggle between compound and simple interest, add part-time income, and visualize how grace periods change your total cost.
        </p>
      </header>

      <LoanForm values={formValues} onChange={handleChange} onSubmit={handleCalculate} errors={errors} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <SummaryPanel metrics={metrics} currency={formValues.currency} principal={totalPrincipal} />
          <LoanChart metrics={metrics} currency={formValues.currency} />
        </div>
        <aside className="card p-6 md:p-7 space-y-4">
          <h2 className="section-title">How this calculator works</h2>
          <ul className="space-y-3 text-slate-300 text-sm leading-relaxed list-disc list-inside">
            <li>Grace-period interest accrues monthly, optionally compounding, and is capitalized into your balance.</li>
            <li>Monthly payments are amortized using your selected interest model; optional prepayments reduce the payoff timeline.</li>
            <li>Charts visualize principal vs. interest per month and compare balances with and without a grace period.</li>
            <li>All calculations stay client-side for privacy. Currency selection changes formatting only.</li>
          </ul>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Tip: Apply part-time income or a 10-50% early repayment boost to see how much interest you can save.
          </div>
        </aside>
      </div>
    </main>
  );
}
