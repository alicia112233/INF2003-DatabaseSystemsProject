import { NextResponse } from "next/server";

// In-memory orders data for demo
let orders = [
  {
    id: 1,
    customer: "Ryson Feng",
    email: "rysonfeng@admin.com",
    gameTitle: "Super Mario Bros.",
    total: 120.5,
    status: "Pending",
    createdAt: "6/23/2025",
  },
  {
    id: 2,
    customer: "Qwerty Tan",
    email: "qwerty@admin.com",
    gameTitle: "Dota 2",
    total: 89.99,
    status: "Shipped",
    createdAt: "6/23/2025",
  },
  {
    id: 3,
    customer: "alicia tang",
    email: "aliciatangweishan@gmail.com",
    gameTitle: "FIFA 24",
    total: 45.0,
    status: "Delivered",
    createdAt: "6/23/2025",
  },
];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const data = await req.json();
  const newOrder = {
    ...data,
    id: orders.length ? Math.max(...orders.map((o) => o.id)) + 1 : 1,
    createdAt: new Date().toLocaleDateString(),
  };
  orders.push(newOrder);
  return NextResponse.json(newOrder, { status: 201 });
}

export async function PUT(req: Request) {
  const data = await req.json();
  const idx = orders.findIndex((o) => o.id === data.id);
  if (idx === -1) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  orders[idx] = { ...orders[idx], ...data };
  return NextResponse.json(orders[idx]);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  orders = orders.filter((o) => o.id !== id);
  return NextResponse.json({ success: true });
}
