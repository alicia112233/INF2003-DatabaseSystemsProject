'use client';

import React, { useEffect, useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const SalesOverview = () => {
  // Month in "YYYY-MM" format
  const [month, setMonth] = useState('');
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);

  // Chart data states
  const [categories, setCategories] = useState<string[]>([]);
  const [earnings, setEarnings] = useState<number[]>([]);
  const [expense, setExpense] = useState<number[]>([]);

  const handleChange = (event: any) => {
    setMonth(event.target.value);
  };

  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;

  // Fetch available months for dropdown
  useEffect(() => {
    async function fetchAvailableMonths() {
      try {
        const res = await fetch('/api/admin/available-months');
        if (!res.ok) throw new Error('Failed to fetch available months');
        const data = await res.json();
        setMonthOptions(data.months);

        if (data.months.length > 0) {
          setMonth(data.months[0].value);
        }
      } catch (err) {
        console.error('Failed to fetch available months:', err);
        // Fallback static options
        setMonthOptions([
          { value: '2025-03', label: 'March 2025' },
          { value: '2025-04', label: 'April 2025' },
          { value: '2025-05', label: 'May 2025' },
        ]);
        setMonth('2025-03');
      }
    }

    fetchAvailableMonths();
  }, []);

  // Fetch sales data when month changes
  useEffect(() => {
    if (!month) return;

    async function fetchSalesData() {
      try {
        // Split "YYYY-MM" to year and month parts
        const [yearStr, monthStr] = month.split('-');
        const res = await fetch(`/api/admin/total-sales?month=${monthStr}&year=${yearStr}`);
        if (!res.ok) throw new Error('Failed to fetch sales data');
        const data = await res.json(); // Expected array of { day, earnings, expense }

        // Format days as zero-padded strings e.g. "01", "02"
        setCategories(data.map((d: any) => d.day.toString().padStart(2, '0')));
        setEarnings(data.map((d: any) => d.earnings));
        setExpense(data.map((d: any) => d.expense));
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
        // Clear data on error to avoid stale display
        setCategories([]);
        setEarnings([]);
        setExpense([]);
      }
    }

    fetchSalesData();
  }, [month]);

  // Chart configuration
  const optionscolumnchart: any = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: true },
      height: 370,
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        barHeight: '60%',
        columnWidth: '42%',
        borderRadius: [6],
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: 'butt',
      colors: ['transparent'],
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    yaxis: { tickAmount: 4 },
    xaxis: {
      categories,
      axisBorder: { show: false },
    },
    tooltip: {
      theme: 'dark',
      fillSeriesColor: false,
    },
  };

  const seriescolumnchart: any = [
    { name: 'Order Earnings this month', data: earnings },
    { name: 'Rental Earnings this month', data: expense },
  ];

  return (
    <DashboardCard
      title="Sales Overview"
      action={
        <Select
          labelId="month-dd"
          id="month-dd"
          value={month}
          size="small"
          onChange={handleChange}
        >
          {monthOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      }
    >
      <Chart options={optionscolumnchart} series={seriescolumnchart} type="bar" height={370} width="100%" />
    </DashboardCard>
  );
};

export default SalesOverview;
