export type CurrencyOption = 'USD' | 'INR' | 'EUR' | 'GBP';
export type InterestType = 'simple' | 'compound';

export interface LoanFormValues {
  tuition: number;
  livingExpenses: number;
  interestRate: number; // annual percentage
  loanTermYears: number;
  gracePeriodMonths: number;
  startDate: string;
  currency: CurrencyOption;
  partTimeIncome: number;
  earlyRepaymentRate: number; // 0 - 1 range representing % of base payment
  interestType: InterestType;
}

export interface PaymentBreakdown {
  monthIndex: number;
  label: string;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanMetrics {
  monthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  schedule: PaymentBreakdown[];
  alternativeSchedule: PaymentBreakdown[];
  graceImpact: {
    interestAccruedDuringGrace: number;
    addedInterestFromGrace: number;
    totalInterestWithoutGrace: number;
    monthsWithGrace: number;
  };
}

const formatLabel = (baseDate: Date, monthOffset: number) => {
  const date = new Date(baseDate);
  date.setMonth(date.getMonth() + monthOffset);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

interface AmortizationResult {
  schedule: PaymentBreakdown[];
  totalInterest: number;
  totalPaid: number;
}

const buildAmortizationSchedule = (
  startingBalance: number,
  months: number,
  monthlyRate: number,
  basePayment: number,
  extraPayment: number,
  baseDate: Date,
  startOffset: number
): AmortizationResult => {
  const schedule: PaymentBreakdown[] = [];
  let balance = startingBalance;
  let totalInterest = 0;
  let totalPaid = 0;

  for (let i = 0; i < months && balance > 0; i += 1) {
    const interestForMonth = monthlyRate > 0 ? balance * monthlyRate : 0;
    let principalPayment = Math.max(basePayment - interestForMonth, 0);
    let totalPrincipal = Math.min(balance, principalPayment);
    let paymentForMonth = totalPrincipal + interestForMonth;

    if (extraPayment > 0 && balance - totalPrincipal > 0) {
      const extra = Math.min(extraPayment, balance - totalPrincipal);
      totalPrincipal += extra;
      paymentForMonth += extra;
    }

    balance = Math.max(0, balance - totalPrincipal);
    totalInterest += interestForMonth;
    totalPaid += paymentForMonth;

    schedule.push({
      monthIndex: startOffset + i,
      label: formatLabel(baseDate, startOffset + i),
      principalPaid: totalPrincipal,
      interestPaid: interestForMonth,
      remainingBalance: balance,
    });

    if (balance <= 0.01) {
      balance = 0;
      break;
    }
  }

  return { schedule, totalInterest, totalPaid };
};

export const calculateLoanMetrics = (values: LoanFormValues): LoanMetrics => {
  const {
    tuition,
    livingExpenses,
    interestRate,
    loanTermYears,
    gracePeriodMonths,
    startDate,
    currency,
    partTimeIncome,
    earlyRepaymentRate,
    interestType,
  } = values;

  const principal = Math.max(0, tuition) + Math.max(0, livingExpenses);
  const totalMonths = Math.max(1, Math.round(loanTermYears * 12));
  const monthlyRate = Math.max(interestRate, 0) / 100 / 12;
  const repaymentStartDate = new Date(startDate || Date.now());
  const safeDate = Number.isNaN(repaymentStartDate.getTime()) ? new Date() : repaymentStartDate;

  let balance = principal;
  let totalInterest = 0;
  const schedule: PaymentBreakdown[] = [];
  let accruedSimpleInterest = 0;

  // Grace period interest accrual
  for (let i = 0; i < Math.max(0, gracePeriodMonths); i += 1) {
    const interestBase = interestType === 'compound' ? balance : principal;
    const interestForMonth = monthlyRate > 0 ? interestBase * monthlyRate : 0;
    totalInterest += interestForMonth;

    if (interestType === 'compound') {
      balance += interestForMonth;
    } else {
      accruedSimpleInterest += interestForMonth;
    }

    schedule.push({
      monthIndex: i,
      label: formatLabel(safeDate, i),
      principalPaid: 0,
      interestPaid: interestForMonth,
      remainingBalance: interestType === 'compound' ? balance : principal + accruedSimpleInterest,
    });
  }

  if (interestType === 'simple') {
    balance = principal + accruedSimpleInterest;
  }

  // Base monthly payment (excluding extra prepayments)
  const monthlyPayment =
    monthlyRate > 0
      ? (balance * monthlyRate * (1 + monthlyRate) ** totalMonths) /
        ((1 + monthlyRate) ** totalMonths - 1)
      : balance / totalMonths;

  const extraPayment = Math.max(0, partTimeIncome) + Math.max(0, earlyRepaymentRate) * monthlyPayment;

  const amortization = buildAmortizationSchedule(
    balance,
    totalMonths,
    monthlyRate,
    monthlyPayment,
    extraPayment,
    safeDate,
    schedule.length
  );

  totalInterest += amortization.totalInterest;
  const repaymentSchedule = [...schedule, ...amortization.schedule];

  // Alternate scenario without a grace period to show impact
  const basePaymentNoGrace =
    monthlyRate > 0
      ? (principal * monthlyRate * (1 + monthlyRate) ** totalMonths) /
        ((1 + monthlyRate) ** totalMonths - 1)
      : principal / totalMonths;

  const extraPaymentNoGrace = Math.max(0, partTimeIncome) + Math.max(0, earlyRepaymentRate) * basePaymentNoGrace;
  const altSchedule = buildAmortizationSchedule(
    principal,
    totalMonths,
    monthlyRate,
    basePaymentNoGrace,
    extraPaymentNoGrace,
    safeDate,
    0
  );

  const addedInterestFromGrace = Math.max(totalInterest - altSchedule.totalInterest, 0);

  return {
    monthlyPayment,
    totalRepayment: amortization.totalPaid,
    totalInterest,
    schedule: repaymentSchedule,
    alternativeSchedule: altSchedule.schedule,
    graceImpact: {
      interestAccruedDuringGrace: accruedSimpleInterest + (interestType === 'compound' ? balance - (principal + accruedSimpleInterest) : 0),
      addedInterestFromGrace,
      totalInterestWithoutGrace: altSchedule.totalInterest,
      monthsWithGrace: Math.max(0, gracePeriodMonths),
    },
  };
};
