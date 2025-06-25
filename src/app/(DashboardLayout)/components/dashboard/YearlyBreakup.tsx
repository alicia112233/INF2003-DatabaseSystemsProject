
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar } from '@mui/material';
import { IconArrowUpLeft } from '@tabler/icons-react';

import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import React, { useEffect, useState } from "react";
import { TextRotationAngledown } from "@mui/icons-material";

const YearlyBreakup = () => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const primarylight = '#ecf2ff';
  const successlight = theme.palette.success.light;
  const errorlight = theme.palette.error.light;
  const warninglight = theme.palette.warning.light;

  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState("0");
  const [series, setSeries] = useState([0, 0, 0]);

  // Determine styles and icon direction based on percent

  const percentNum = parseFloat(percent); // safely convert string to number
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
          : 'rotate(135deg)',   // → neutral
      }}
    />
  );

  useEffect(() => {
    fetch('/api/admin/yearly')
      .then(res => res.json())
      .then(data => {
        setTotal(data.total2025);
        setPercent(data.percentageChange);
        setSeries([
          data.total2024 || 0,
          data.total2025 || 0,
          0  // filler slice so chart gets 3 values
        ]);
      })
      .catch(err => console.error("Yearly data error:", err));
  }, []);

  // chart
  const optionscolumnchart: any = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: {
        show: false,
      },
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
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 991,
        options: {
          chart: {
            width: 120,
          },
        },
      },
    ],
  };
  const seriescolumnchart: number[] = 
  series.length === 3 && series.some(val => val > 0)
    ? series
    : [25, 50, 0]; //fallback

  return (
    <DashboardCard title="Yearly Breakup">
      <Grid container spacing={3}>
        {/* column */}
        <Grid
          size={{
            xs: 7,
            sm: 7
          }}>
          <Typography variant="h3" fontWeight="700">
            ${typeof total === 'number' ? `${total.toLocaleString()}` : '0'}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Avatar sx={{ bgcolor: percentBg, width: 27, height: 27 }}>
              {percentIcon}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="600">
              {percentNum > 0 ? `+${percentNum}` : `0.00`}%
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              last year
            </Typography>
          </Stack>
          <Stack spacing={3} mt={5} direction="row">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primary, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                2024
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{ width: 9, height: 9, bgcolor: primarylight, svg: { display: 'none' } }}
              ></Avatar>
              <Typography variant="subtitle2" color="textSecondary">
                2025
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        {/* column */}
        <Grid
          size={{
            xs: 5,
            sm: 5
          }}>
          <Chart
            options={optionscolumnchart}
            series={seriescolumnchart}
            type="donut"
            height={150} width={"100%"}
          />
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default YearlyBreakup;
