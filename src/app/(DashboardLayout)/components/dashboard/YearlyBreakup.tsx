import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';

import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import React, { useEffect, useState } from "react";

const YearlyBreakup = () => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;
  const errorlight = theme.palette.error.light;
  const warninglight = theme.palette.warning.light;

  const [totalCurrentYear, setTotalCurrentYear] = useState(0);
  const [totalLastYear, setTotalLastYear] = useState(0);
  const [percent, setPercent] = useState("0");
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [lastYear, setLastYear] = useState<number | null>(null);

  // Determine styles and icon direction based on percent
  const percentNum = parseFloat(percent);
  const isPositive = percentNum > 0;
  const isNegative = percentNum < 0;

  const percentBg = isPositive
    ? '#e0f8dd' // green
    : isNegative
      ? '#feebe9' // red
      : '#fff8de'; // yellow

  const percentColor = isPositive
    ? successlight
    : isNegative
      ? errorlight
      : warninglight;

  const percentIcon = (
    <IconArrowUpLeft
      width={20}
      color={percentColor}
      style={{
        transform: isPositive
          ? 'rotate(90deg)'     // ↖ up
          : isNegative
            ? 'rotate(180deg)'   // ↙ down
            : 'rotate(135deg)',  // → neutral
      }}
    />
  );

  useEffect(() => {
    fetch('/api/admin/yearly')
      .then(res => res.json())
      .then(data => {
        // The API returns keys like { '2024': 123, '2025': 456, percentageChange: 'x.xx' }
        // Extract years dynamically:
        const years = Object.keys(data).filter(k => /^\d{4}$/.test(k)).map(Number).sort();

        if (years.length >= 2) {
          const [ly, cy] = years; // lastYear, currentYear (ascending order)
          setLastYear(ly);
          setCurrentYear(cy);
          setTotalLastYear(data[ly] || 0);
          setTotalCurrentYear(data[cy] || 0);
        } else {
          // Fallback if only one year or none
          setCurrentYear(years[0] || new Date().getFullYear());
          setTotalCurrentYear(data[years[0]] || 0);
          setLastYear(null);
          setTotalLastYear(0);
        }

        setPercent(data.percentageChange || "0");
      })
      .catch(err => console.error("Yearly data error:", err));
  }, []);

  // Prepare series for donut chart - 3 slices: lastYear, currentYear, filler
  const series = [
    totalLastYear,
    totalCurrentYear,
    0 // filler slice
  ];

  const optionscolumnchart: any = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 155,
    },
    colors: [primary, primarylight, '#F9F9FD'],
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        donut: {
          size: '75%',
          background: 'transparent',
        },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      fillSeriesColor: false,
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 991,
        options: { chart: { width: 120 } },
      },
    ],
  };

  // Fallback if all zeros
  const seriescolumnchart: number[] =
    series.some(val => val > 0)
      ? series
      : [25, 50, 0];

  return (
    <DashboardCard title="Yearly Breakup">
      <Grid container spacing={3}>
        {/* Left column: totals and percent */}
        <Grid size={{xs: 7,sm: 7}}>
          <Typography variant="h3" fontWeight="700">
            ${totalCurrentYear.toFixed(2)}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: percentBg, width: 27, height: 27 }}>
              {percentIcon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {percentNum > 0 ? `+${percentNum}` : percentNum < 0 ? `${percentNum}` : '0'}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" sx={{ userSelect: "none" }}>
              {lastYear ? `${lastYear}` : "Last Year"}
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            {/* Legend: last year */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              />
              <Typography variant="subtitle2" color="textSecondary">
                {lastYear ?? 'Last Year'}
              </Typography>
            </Stack>
            {/* Legend: current year */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}
              />
              <Typography variant="subtitle2" color="textSecondary">
                {currentYear ?? new Date().getFullYear()}
              </Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Right column: donut chart */}
        <Grid size={{xs: 5,sm: 5}}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height={150}
            width={"100%"}
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default YearlyBreakup;
