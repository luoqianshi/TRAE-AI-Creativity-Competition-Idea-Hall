import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');

  if (!dateStr) {
    return NextResponse.json({ error: '缺失日期参数' }, { status: 400 });
  }

  const currentDate = new Date(dateStr);
  const previousDate = new Date(currentDate);
  previousDate.setDate(previousDate.getDate() - 1);

  const prevDateStr = previousDate.toISOString().split('T')[0];

  try {
    const todayRecord = await prisma.dailyRecord.findUnique({
      where: { date: dateStr },
    });

    const yesterdayRecord = await prisma.dailyRecord.findUnique({
      where: { date: prevDateStr },
    });

    return NextResponse.json({
      today: todayRecord,
      yesterday: yesterdayRecord,
    });
  } catch (error) {
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, power1, power2, water1, water2, gas } = body;

    if (!date) {
      return NextResponse.json({ error: '缺失日期参数' }, { status: 400 });
    }

    const record = await prisma.dailyRecord.upsert({
      where: { date },
      update: {
        power1: Number(power1),
        power2: Number(power2),
        water1: Number(water1),
        water2: Number(water2),
        gas: Number(gas),
      },
      create: {
        date,
        power1: Number(power1),
        power2: Number(power2),
        water1: Number(water1),
        water2: Number(water2),
        gas: Number(gas),
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ error: '保存数据失败' }, { status: 500 });
  }
}
