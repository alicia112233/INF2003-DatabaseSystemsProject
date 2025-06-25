'use client';

import React, { useEffect, useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const SalesOverview = () => {
    // select - changed to string to match the value type
    const [month, setMonth] = useState('');
    const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);

    // NEW: state for dynamic chart data
    const [categories, setCategories] = useState<string[]>([]);
    const [earnings, setEarnings] = useState<number[]>([]);
    const [expense, setExpense] = useState<number[]>([]);

    const handleChange = (event: any) => {
        setMonth(event.target.value);
    };

    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // NEW: fetch available months from database
    useEffect(() => {
        async function fetchAvailableMonths() {
            try {
                const res = await fetch('/api/admin/available-months'); // You'll need to create this endpoint
                if (!res.ok) throw new Error('Failed to fetch available months');
                const data = await res.json();

                // Assuming API returns something like:
                // { months: [{ value: '2025-01', label: 'January 2025' }, { value: '2025-02', label: 'February 2025' }, ...] }
                
                setMonthOptions(data.months);
                
                // Set default month to the first available month
                if (data.months.length > 0) {
                    setMonth(data.months[0].value);
                }
            } catch (err) {
                console.error('Failed to fetch available months:', err);
                // Fallback to hardcoded months if API fails
                setMonthOptions([
                    { value: '2025-03', label: 'March 2025' },
                    { value: '2025-04', label: 'April 2025' },
                    { value: '2025-05', label: 'May 2025' }
                ]);
                setMonth('2025-03');
            }
        }

        fetchAvailableMonths();
    }, []);

    // NEW: fetch data when month changes
    useEffect(() => {
        if (!month) return; // Don't fetch if no month is selected

        async function fetchSalesData() {
            try {
                const res = await fetch(`/api/admin/total-sales?month=${month}&year=2025`);
                if (!res.ok) throw new Error('Failed to fetch sales data');
                const data = await res.json();

                // Assuming API returns something like:
                // { categories: ['16/08', '17/08', ...], earnings: [355, 390, ...], expense: [280, 250, ...] }

                setCategories(data.categories);
                setEarnings(data.earnings);
                setExpense(data.expense);
            } catch (err) {
                console.error('Failed to fetch sales data:', err);
            }
        }

        fetchSalesData();
    }, [month]);

    // chart
    const optionscolumnchart: any = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
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
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
        },
        xaxis: {
            categories: categories.length > 0 ? categories: ['16/08', '17/08', '18/08', '19/08', '20/08', '21/08', '22/08', '23/08'], // fallback
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: 'dark',
            fillSeriesColor: false,
        },
    };
    const seriescolumnchart: any = [
        {
            name: 'Earnings this month',
            data: earnings.length > 0 ? earnings : [355, 390, 300, 350, 390, 180, 355, 390], // fallback
        },
        {
            name: 'Expense this month',
            data: expense.length > 0 ? expense : [280, 250, 325, 215, 250, 310, 280, 250], // fallback
        },
    ];

    return (
        <DashboardCard title="Sales Overview" action={
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
        }>
            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height={370} width={"100%"}
            />
        </DashboardCard>
    );
};

export default SalesOverview;