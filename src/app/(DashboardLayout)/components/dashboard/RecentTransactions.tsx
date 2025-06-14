import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from '@mui/lab';
import { Typography, Box, Link } from '@mui/material';

const RecentTransactions = () => {
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
        <TimelineItem>
          <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Payment received from John Doe of $385.90</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent>10:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="secondary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography fontWeight="600">New sale recorded</Typography>{' '}
            <Link href="/" underline="none">
              #ML-3467
            </Link>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="success" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>Payment was made of $64.95 to Michael</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="warning" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography fontWeight="600">New sale recorded</Typography>{' '}
            <Link href="/" underline="none">
              #ML-3467
            </Link>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent>09:30 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="error" />
          </TimelineSeparator>
          <TimelineContent>
            <Typography fontWeight="600">New arrival recorded</Typography>
          </TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineOppositeContent>12:00 am</TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color="success" />
          </TimelineSeparator>
          <TimelineContent>Payment Received</TimelineContent>
        </TimelineItem>
      </Timeline>
    </Box>
  );
};

export default RecentTransactions;