'use client';

import React, { useEffect, useState } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/lab';
import { Typography, Box, Link, CircularProgress } from '@mui/material';

type Transaction = {
  time: string;
  type: string;
  description: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  link?: string;
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/recent-transactions')
      .then((res) => res.json())
      .then((data: Transaction[]) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch transactions', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Recent Transactions
      </Typography>
      <Timeline
        className="theme-timeline"
        sx={{
          p: 0,
          mb: '-40px',
          '& .MuiTimelineConnector-root': {
            width: '1px',
            backgroundColor: '#efefef',
          },
          '& .MuiTimelineItem-root': {
            '&:before': {
              display: 'none',
            },
          },
        }}
      >
        {transactions.map((txn, idx) => (
          <TimelineItem key={idx}>
            <TimelineOppositeContent>{txn.time}</TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={txn.color} />
              {idx < transactions.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {txn.type === 'sale' ? (
                <>
                  <Typography fontWeight="600">New sale recorded</Typography>{' '}
                  <Typography color="textSecondary">{txn.description}</Typography>
                </>
              ) : (
                <Typography>{txn.description}</Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default RecentTransactions;
