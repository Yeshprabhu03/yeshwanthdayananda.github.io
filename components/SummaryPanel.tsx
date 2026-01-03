import { CurrencyOption, LoanMetrics } from '@/utils/calculateLoanMetrics';

interface SummaryPanelProps {
  metrics?: LoanMetrics;
  currency: CurrencyOption;
  principal: number;
}

const formatCurrency = (value: number, currency: CurrencyOption) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const SummaryPanel = ({ metrics, currency, principal }: SummaryPanelProps) => {
  if (!metrics) {
    return (
      <div className="card p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="badge">Summary</span>
          <p className="text-sm text-slate-300">Your repayment summary will appear after running a calculation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Monthly payment", "Total repayment", "Total interest"].map((label) => (
            <div key={label} className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
              <p className="text-2xl font-semibold text-slate-200 mt-1">—</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { monthlyPayment, totalRepayment, totalInterest, graceImpact } = metrics;

  return (
    <div className="card p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="badge">Summary</span>
          <p className="text-sm text-slate-300">Snapshot of your repayment with grace-period effects.</p>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 border border-emerald-400/30">
          Principal: {formatCurrency(principal, currency)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-floating">
          <p className="text-xs uppercase tracking-wide text-slate-400">Monthly Payment</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-1">{formatCurrency(monthlyPayment, currency)}</p>
          <p className="text-xs text-slate-400 mt-2">Base amortized payment excluding optional extra prepayments.</p>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-floating">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Repayment</p>
          <p className="text-3xl font-semibold text-slate-50 mt-1">{formatCurrency(totalRepayment, currency)}</p>
          <p className="text-xs text-slate-400 mt-2">Includes principal, grace-period interest, and any extra payments.</p>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 shadow-floating">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Interest Paid</p>
          <p className="text-3xl font-semibold text-amber-300 mt-1">{formatCurrency(totalInterest, currency)}</p>
          <p className="text-xs text-slate-400 mt-2">Interest across grace period and repayment horizon.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-slate-200">Grace period impact</p>
          <p className="text-xs text-slate-400">Added cost compared to starting payments immediately.</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span>Interest accrued during grace</span>
              <span className="text-amber-200">{formatCurrency(graceImpact.interestAccruedDuringGrace, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Added interest because of grace</span>
              <span className="text-amber-200">{formatCurrency(graceImpact.addedInterestFromGrace, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total interest without grace</span>
              <span className="text-slate-100">{formatCurrency(graceImpact.totalInterestWithoutGrace, currency)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-slate-200">Tips</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
            <li>Applying part-time income or an early repayment boost can shorten the timeline.</li>
            <li>Grace periods add cost through accrued interest—compare both scenarios above.</li>
            <li>Experiment with currencies; values display in {currency} but calculations stay consistent.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
