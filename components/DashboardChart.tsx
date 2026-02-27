'use client';

import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DashboardChartProps {
  codes: string[];
  enrollments: number[];
}

export default function DashboardChart({ codes, enrollments }: DashboardChartProps) {
  const options = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
    },
    theme: { mode: 'dark' as const },
    plotOptions: {
      bar: { horizontal: false, borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: codes,
      labels: { style: { colors: '#94a3b8' } },
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8' } },
    },
    colors: ['#3B82F6'],
    grid: { borderColor: '#334155' },
    responsive: [
      {
        breakpoint: 640,
        options: {
          chart: { height: 220 },
          xaxis: {
            labels: {
              rotate: -45,
              style: { fontSize: '10px', colors: '#94a3b8' },
            },
          },
        },
      },
    ],
  };

  const series = [{ name: 'Students Enrolled', data: enrollments }];

  return (
    <Chart options={options} series={series} type="bar" height={300} width="100%" />
  );
}
