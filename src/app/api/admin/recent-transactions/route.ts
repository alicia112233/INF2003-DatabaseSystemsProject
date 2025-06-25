// app/api/admin/recent-transactions/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const data = [
    {
      time: '09:30 am',
      type: 'payment',
      description: 'Payment received from John Doe of $385.90',
      color: 'primary',
    },
    {
      time: '10:00 am',
      type: 'sale',
      description: '#ML-3467',
      color: 'secondary',
      link: '/',
    },
    {
      time: '12:00 am',
      type: 'payment',
      description: 'Payment was made of $64.95 to Michael',
      color: 'success',
    },
    {
      time: '09:30 am',
      type: 'sale',
      description: '#ML-3488',
      color: 'warning',
      link: '/',
    },
    {
      time: '09:30 am',
      type: 'arrival',
      description: 'New arrival recorded',
      color: 'error',
    },
    {
      time: '12:00 am',
      type: 'payment',
      description: 'Payment Received',
      color: 'success',
    },
  ];

  return NextResponse.json(data);
}
