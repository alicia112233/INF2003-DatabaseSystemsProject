import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowUpRight, IconCurrencyDollar } from '@tabler/icons-react';
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

  // Calculate last month and previous month dynamically
  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const lastMonth = lastMonthDate.getMonth() + 1; // 1-based
  const lastMonthYear = lastMonthDate.getFullYear();

  const currentMonth = currentMonthDate.getMonth() + 1;
  const currentMonthYear = currentMonthDate.getFullYear();

  const lastMonthLabel = lastMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthLabel = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const theme = useTheme();
  const secondary = theme.palette.secondary.main;
  const secondarylight = '#f5fcff';
  const errorlight = theme.palette.error.light;
  const successlight = theme.palette.success.light;
  const warninglight = theme.palette.warning.light;

  const isPositive = percent > 0;
  const isNegative = percent < 0;

  const percentBg = isPositive
    ? '#e0f8dd'
    : isNegative
    ? '#feebe9'
    : '#fff8de';

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
          ? 'rotate(0deg)'
          : isNegative
          ? 'rotate(90deg)'
          : 'rotate(45deg)',
      }}
    />
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [currRes, lastRes] = await Promise.all([
        fetch(`/api/admin/monthly-earnings?month=${currentMonth}&year=${currentMonthYear}`).then(res => res.json()),
        fetch(`/api/admin/monthly-earnings?month=${lastMonth}&year=${lastMonthYear}`).then(res => res.json())
      ]);

      const daysInCurrMonth = new Date(currentMonthYear, currentMonth, 0).getDate();
      const dailyEarningsCurr = Array(daysInCurrMonth).fill(0);
      let totalCurr = 0;

      currRes.forEach(({ day, earnings }: { day: number; earnings: number | string }) => {
        const earningNum = typeof earnings === "number" ? earnings : parseFloat(earnings);
        dailyEarningsCurr[day - 1] = parseFloat(earningNum.toFixed(2));
        totalCurr += earningNum;
      });

      setEarnings(dailyEarningsCurr);
      setTotal(totalCurr);

      let totalLast = 0;
      lastRes.forEach(({ earnings }: { earnings: number }) => {
        const earningNum = typeof earnings === "number" ? earnings : parseFloat(earnings);
        totalLast += earningNum;
      });

      let pctChange = 0;
      if (totalLast > 0) {
        pctChange = ((totalCurr - totalLast) / totalLast) * 100;
      } else if (totalCurr > 0) {
        pctChange = 100;
      }
      setPercent(parseFloat(pctChange.toFixed(1)));

    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
}, [lastMonth, lastMonthYear, currentMonth, currentMonthYear]);


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
      title={`Monthly Earnings (${currentMonthLabel})`}
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
            compared to {lastMonthLabel}
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
