import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconCurrencyDollar, IconArrowUpRight } from '@tabler/icons-react';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MonthlyEarnings = () => {
  const [isClient, setIsClient] = useState(false);
  const [earnings, setEarnings] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(0);

  // Use current month/year or let user select (hardcoded here for demo)
  const month = 5; // May
  const year = 2025;

  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = theme.palette.error.light;
  const successlight = theme.palette.success.light;
  const warninglight = theme.palette.warning.light;

  // Determine if percent change positive or negative for icon color
  const isPositive = percent > 0;
  const isNegative = percent < 0;

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
    <IconArrowUpRight
      width={20}
      color={percentColor}
      style={{
        transform: isPositive
          ? 'rotate(0deg)'     // ↖ up
          : isNegative
          ? 'rotate(90deg)'   // ↙ down
          : 'rotate(45deg)',   // → neutral
      }}
    />
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetch(`/api/admin/monthly-earnings?month=${month}&year=${year}`)
      .then(res => res.json())
      .then((data: { day: number; earnings: number }[]) => {
        // Convert API response to array ordered by day, fill missing days with 0
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyEarnings = Array(daysInMonth).fill(0);
        let totalMonth = 0;

        data.forEach(({ day, earnings }) => {
          dailyEarnings[day - 1] = parseFloat(earnings.toFixed(2));
          totalMonth += earnings;
        });

        setEarnings(dailyEarnings);
        setTotal(totalMonth);

        // For demo, random percent change (you can calculate based on last month or year)
        setPercent(9); // example positive change
      })
      .catch(console.error);
  }, [month, year]);

  const optionscolumnchart: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true },
      group: 'sparklines',
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: { colors: [secondarylight], type: 'solid', opacity: 0.05 },
    markers: { size: 0 },
    tooltip: { theme: theme.palette.mode === 'dark' ? 'dark' : 'light' },
  };

  const seriescolumnchart = [
    {
      name: 'Earnings',
      color: secondary,
      data: earnings.length > 0 ? earnings : [0],
    },
  ];

  return (
    <DashboardCard
      title="Monthly Earnings"
      action={
        <Fab color="secondary" size="medium" sx={{ color: '#ffffff' }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        isClient ? (
          <Chart options={optionscolumnchart} series={seriescolumnchart} type="area" height={60} width={"100%"} />
        ) : (
          <div style={{ height: '60px' }} />
        )
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: percentBg, width: 27, height: 27 }}>
            {percentIcon}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {isPositive ? `+${percent}%` : `${percent}%`}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            last month
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
