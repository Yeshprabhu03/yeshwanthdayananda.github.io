import { CurrencyOption, InterestType, LoanFormValues } from '@/utils/calculateLoanMetrics';
import { ChangeEvent, FormEvent } from 'react';

interface LoanFormProps {
  values: LoanFormValues;
  onChange: (field: keyof LoanFormValues, value: number | string) => void;
  onSubmit: () => void;
  errors: Partial<Record<keyof LoanFormValues, string>>;
}

const currencies: CurrencyOption[] = ['USD', 'INR', 'EUR', 'GBP'];
const interestTypes: InterestType[] = ['compound', 'simple'];

const currencySymbols: Record<CurrencyOption, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

export const LoanForm = ({ values, onChange, onSubmit, errors }: LoanFormProps) => {
  const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = value === '' ? 0 : Number(value);
    onChange(name as keyof LoanFormValues, Number.isNaN(numericValue) ? 0 : numericValue);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="badge">Loan Inputs</span>
          <p className="text-sm text-slate-300">Enter your tuition, living costs, and repayment details.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="label">Tuition</span>
            <input
              name="tuition"
              type="number"
              min={0}
              className={`input ${errors.tuition ? 'input--error' : ''}`}
              value={values.tuition}
              onChange={handleNumberChange}
              placeholder="15000"
            />
            {errors.tuition && <p className="text-xs text-rose-400">{errors.tuition}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Living Expenses</span>
            <input
              name="livingExpenses"
              type="number"
              min={0}
              className={`input ${errors.livingExpenses ? 'input--error' : ''}`}
              value={values.livingExpenses}
              onChange={handleNumberChange}
              placeholder="8000"
            />
            {errors.livingExpenses && <p className="text-xs text-rose-400">{errors.livingExpenses}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Interest Rate (APR %)</span>
            <input
              name="interestRate"
              type="number"
              min={0}
              step="0.1"
              className={`input ${errors.interestRate ? 'input--error' : ''}`}
              value={values.interestRate}
              onChange={handleNumberChange}
              placeholder="5.5"
            />
            {errors.interestRate && <p className="text-xs text-rose-400">{errors.interestRate}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Loan Term (years)</span>
            <input
              name="loanTermYears"
              type="number"
              min={1}
              step="0.5"
              className={`input ${errors.loanTermYears ? 'input--error' : ''}`}
              value={values.loanTermYears}
              onChange={handleNumberChange}
              placeholder="10"
            />
            {errors.loanTermYears && <p className="text-xs text-rose-400">{errors.loanTermYears}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Grace Period (months)</span>
            <input
              name="gracePeriodMonths"
              type="number"
              min={0}
              className={`input ${errors.gracePeriodMonths ? 'input--error' : ''}`}
              value={values.gracePeriodMonths}
              onChange={handleNumberChange}
              placeholder="6"
            />
            {errors.gracePeriodMonths && <p className="text-xs text-rose-400">{errors.gracePeriodMonths}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Repayment Start Date</span>
            <input
              name="startDate"
              type="date"
              className={`input ${errors.startDate ? 'input--error' : ''}`}
              value={values.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
            />
            {errors.startDate && <p className="text-xs text-rose-400">{errors.startDate}</p>}
          </label>
          <label className="space-y-2">
            <span className="label">Currency</span>
            <select
              name="currency"
              className="input bg-slate-900"
              value={values.currency}
              onChange={(event) => onChange('currency', event.target.value)}
            >
              {currencies.map((option) => (
                <option key={option} value={option} className="bg-slate-900">
                  {option} ({currencySymbols[option]})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="label">Interest Type</span>
            <select
              name="interestType"
              className="input bg-slate-900"
              value={values.interestType}
              onChange={(event) => onChange('interestType', event.target.value)}
            >
              {interestTypes.map((option) => (
                <option key={option} value={option} className="bg-slate-900 capitalize">
                  {option.charAt(0).toUpperCase() + option.slice(1)} interest
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="badge">Optional boosts</span>
          <p className="text-sm text-slate-300">Accelerate payoff with income-based prepayments or early repayment boosts.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="label">Part-time Income Applied Monthly</span>
            <input
              name="partTimeIncome"
              type="number"
              min={0}
              className="input"
              value={values.partTimeIncome}
              onChange={handleNumberChange}
              placeholder="300"
            />
            <p className="text-xs text-slate-400">Automatically added as an extra payment toward principal each month.</p>
          </label>
          <label className="space-y-2">
            <div className="flex justify-between">
              <span className="label">Early Repayment Boost</span>
              <span className="text-xs text-slate-400">{Math.round(values.earlyRepaymentRate * 100)}% of base payment</span>
            </div>
            <input
              name="earlyRepaymentRate"
              type="range"
              min={0}
              max={0.5}
              step={0.05}
              value={values.earlyRepaymentRate}
              onChange={(event) => onChange('earlyRepaymentRate', Number(event.target.value))}
              className="w-full accent-emerald-400"
            />
            <p className="text-xs text-slate-400">Add up to +50% of your monthly payment as an extra principal-only payment.</p>
          </label>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>All calculations run locally—no data leaves your browser.</span>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
        >
          Calculate repayment
        </button>
      </div>
    </form>
  );
};
