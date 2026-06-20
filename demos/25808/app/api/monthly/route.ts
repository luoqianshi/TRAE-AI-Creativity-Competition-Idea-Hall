import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!year || !month) {
    return NextResponse.json({ error: '缺失年月参数' }, { status: 400 });
  }

  // 计算当月28日的日期
  const currentMonthDateStr = `${year}-${String(month).padStart(2, '0')}-28T00:00:00.000Z`;
  
  // 计算上月28日的日期
  let prevYear = parseInt(year);
  let prevMonth = parseInt(month) - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevMonthDateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-28T00:00:00.000Z`;

  try {
    const currentRecords = await prisma.monthlyRecord.findMany({
      where: { date: new Date(currentMonthDateStr) },
    });

    const previousRecords = await prisma.monthlyRecord.findMany({
      where: { date: new Date(prevMonthDateStr) },
    });

    return NextResponse.json({
      current: currentRecords,
      previous: previousRecords,
    });
  } catch (error) {
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, records } = body;

    if (!year || !month || !Array.isArray(records)) {
      return NextResponse.json({ error: '无效的数据参数' }, { status: 400 });
    }

    const currentMonthDate = new Date(`${year}-${String(month).padStart(2, '0')}-28T00:00:00.000Z`);

    const operations = records.map((record: any) => {
      return prisma.monthlyRecord.upsert({
        where: {
          date_circuitId: {
            date: currentMonthDate,
            circuitId: record.circuitId,
          },
        },
        update: {
          value: Number(record.value),
        },
        create: {
          date: currentMonthDate,
          circuitId: record.circuitId,
          value: Number(record.value),
        },
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: '保存数据失败' }, { status: 500 });
  }
}
