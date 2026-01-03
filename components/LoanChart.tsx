'use client';

import {
  Bar,
  ChartData,
  ChartOptions,
} from 'react-chartjs-2';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { CurrencyOption, LoanMetrics } from '@/utils/calculateLoanMetrics';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

interface LoanChartProps {
  metrics?: LoanMetrics;
  currency: CurrencyOption;
}

const formatCurrency = (value: number, currency: CurrencyOption) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const LoanChart = ({ metrics, currency }: LoanChartProps) => {
  if (!metrics) {
    return (
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="badge">Projection</span>
          <p className="text-sm text-slate-300">Run a calculation to see the repayment chart.</p>
        </div>
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Principal vs. interest and grace-period comparisons will appear here.
        </div>
      </div>
    );
  }

  const labels = metrics.schedule.map((entry) => entry.label);
  const principalData = metrics.schedule.map((entry) => entry.principalPaid);
  const interestData = metrics.schedule.map((entry) => entry.interestPaid);
  const balanceData = metrics.schedule.map((entry) => entry.remainingBalance);
  const altBalanceData = labels.map((_, index) => metrics.alternativeSchedule[index]?.remainingBalance ?? null);

  const data: ChartData<'bar' | 'line'> = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Principal paid',
        data: principalData,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        stack: 'payments',
        borderRadius: 6,
      },
      {
        type: 'bar' as const,
        label: 'Interest paid',
        data: interestData,
        backgroundColor: 'rgba(251, 191, 36, 0.7)',
        stack: 'payments',
        borderRadius: 6,
      },
      {
        type: 'line' as const,
        label: 'Balance with grace',
        data: balanceData,
        borderColor: '#38bdf8',
        backgroundColor: '#38bdf8',
        yAxisID: 'y1',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
      },
      {
        type: 'line' as const,
        label: 'Balance without grace',
        data: altBalanceData,
        borderColor: '#f472b6',
        backgroundColor: '#f472b6',
        borderDash: [6, 6],
        yAxisID: 'y1',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e2e8f0' },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            const label = context.dataset.label || '';
            return `${label}: ${formatCurrency(value, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#cbd5e1', maxRotation: 0, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'Monthly payment', color: '#cbd5e1' },
      },
      y1: {
        position: 'right',
        stacked: false,
        ticks: { color: '#cbd5e1' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Remaining balance', color: '#cbd5e1' },
      },
    },
  };

  return (
    <div className="card p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <span className="badge">Projection</span>
        <p className="text-sm text-slate-300">Principal vs. interest by month plus a grace-period comparison line.</p>
      </div>
      <div className="h-[420px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
