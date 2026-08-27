import { PrismaClient, CouponStatus, OrderStatus } from '@prisma/client';

export async function seedB2BSeatsAndCoupons(prisma: PrismaClient) {
  console.log('🎟️ [6/7] Seeding Institutional B2B Seat Orders & Coupon Batches...');

  const progFSW = await prisma.program.findUnique({ where: { slug: 'fullstack-web-engineering' } });
  const progAI = await prisma.program.findUnique({ where: { slug: 'applied-ai-machine-learning' } });
  const progDevOps = await prisma.program.findUnique({ where: { slug: 'cloud-devops-engineering' } });

  const colVIT = await prisma.college.findFirst({ where: { name: 'Vellore Institute of Technology (VIT)' } });
  const colIITM = await prisma.college.findFirst({ where: { name: 'Indian Institute of Technology (IIT) Madras' } });
  const colBITS = await prisma.college.findFirst({ where: { name: 'Birla Institute of Technology and Science (BITS) Pilani' } });
  const colDTU = await prisma.college.findFirst({ where: { name: 'Delhi Technological University (DTU)' } });

  if (!progFSW || !progAI || !progDevOps || !colVIT || !colIITM || !colBITS || !colDTU) {
    console.warn('⚠️ Programs or Colleges not found for B2B seed. Skipping.');
    return;
  }

  const colNITK = await prisma.college.findFirst({ where: { name: 'National Institute of Technology Karnataka (NITK) Surathkal' } });
  const colRVCE = await prisma.college.findFirst({ where: { name: 'RV College of Engineering (RVCE)' } });

  // 1. Seat Orders across past months
  const seatOrdersData = [
    {
      collegeId: colVIT.id,
      programId: progFSW.id,
      seatsPurchased: 50,
      seatsRedeemed: 2,
      amount: 249950.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      invoiceRef: 'PO-VIT-2026-001',
      batchCode: 'VIT-FSW-2026',
      createdAt: new Date('2026-02-15T10:00:00Z'),
    },
    {
      collegeId: colBITS.id,
      programId: progDevOps.id,
      seatsPurchased: 30,
      seatsRedeemed: 1,
      amount: 164970.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      invoiceRef: 'PO-BITS-2026-03',
      batchCode: 'BITS-CLD-2026',
      createdAt: new Date('2026-04-10T11:00:00Z'),
    },
    {
      collegeId: colIITM.id,
      programId: progAI.id,
      seatsPurchased: 100,
      seatsRedeemed: 1,
      amount: 599900.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      invoiceRef: 'PO-IITM-2026-08',
      batchCode: 'IITM-AIML-2026',
      createdAt: new Date('2026-06-20T14:30:00Z'),
    },
    {
      collegeId: colNITK?.id || colVIT.id,
      programId: progFSW.id,
      seatsPurchased: 40,
      seatsRedeemed: 1,
      amount: 199960.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      invoiceRef: 'PO-NITK-2026-07',
      batchCode: 'NITK-FSW-2026',
      createdAt: new Date('2026-07-18T09:15:00Z'),
    },
    {
      collegeId: colRVCE?.id || colVIT.id,
      programId: progAI.id,
      seatsPurchased: 35,
      seatsRedeemed: 1,
      amount: 209965.0,
      currency: 'INR',
      status: OrderStatus.PAID,
      invoiceRef: 'PO-RVCE-2026-08',
      batchCode: 'RVCE-AIML-2026',
      createdAt: new Date('2026-08-08T12:00:00Z'),
    },
    {
      collegeId: colDTU.id,
      programId: progFSW.id,
      seatsPurchased: 25,
      seatsRedeemed: 0,
      amount: 124975.0,
      currency: 'INR',
      status: OrderStatus.PENDING,
      invoiceRef: 'PO-DTU-2026-PENDING',
      batchCode: 'DTU-FSW-2026',
      createdAt: new Date('2026-08-14T16:00:00Z'),
    },
  ];

  for (const sod of seatOrdersData) {
    let seatOrder = await prisma.seatOrder.findFirst({
      where: { invoiceRef: sod.invoiceRef },
    });

    if (seatOrder) {
      seatOrder = await prisma.seatOrder.update({
        where: { id: seatOrder.id },
        data: {
          collegeId: sod.collegeId,
          programId: sod.programId,
          seatsPurchased: sod.seatsPurchased,
          seatsRedeemed: sod.seatsRedeemed,
          amount: sod.amount,
          currency: sod.currency,
          status: sod.status,
          createdAt: sod.createdAt,
        },
      });
    } else {
      seatOrder = await prisma.seatOrder.create({
        data: {
          collegeId: sod.collegeId,
          programId: sod.programId,
          seatsPurchased: sod.seatsPurchased,
          seatsRedeemed: sod.seatsRedeemed,
          amount: sod.amount,
          currency: sod.currency,
          status: sod.status,
          invoiceRef: sod.invoiceRef,
          createdAt: sod.createdAt,
        },
      });
    }

    // Coupon Batch (Only if PAID)
    if (sod.status === OrderStatus.PAID) {
      const batch = await prisma.couponBatch.upsert({
        where: { batchCode: sod.batchCode },
        update: {
          collegeId: sod.collegeId,
          seatOrderId: seatOrder.id,
          programId: sod.programId,
          totalCoupons: sod.seatsPurchased,
        },
        create: {
          collegeId: sod.collegeId,
          seatOrderId: seatOrder.id,
          programId: sod.programId,
          batchCode: sod.batchCode,
          totalCoupons: sod.seatsPurchased,
        },
      });

      // Generate individual coupon codes in batch
      for (let i = 1; i <= Math.min(sod.seatsPurchased, 25); i++) {
        const code = `${sod.batchCode}-${String(1000 + i)}`;
        await prisma.coupon.upsert({
          where: { code },
          update: {},
          create: {
            batchId: batch.id,
            code,
            status: CouponStatus.ACTIVE,
          },
        });
      }
    }
  }

  // 2. Standalone Marketing Campaign Batch
  const marketingBatch = await prisma.couponBatch.upsert({
    where: { batchCode: 'HACKATHON-2026' },
    update: { programId: progFSW.id, totalCoupons: 10 },
    create: {
      programId: progFSW.id,
      batchCode: 'HACKATHON-2026',
      totalCoupons: 10,
    },
  });

  for (let i = 1; i <= 10; i++) {
    const code = `HACK26-${String(100 + i)}`;
    await prisma.coupon.upsert({
      where: { code },
      update: {},
      create: {
        batchId: marketingBatch.id,
        code,
        status: CouponStatus.ACTIVE,
      },
    });
  }

  console.log(`  ✅ ${seatOrdersData.length} B2B Seat Orders & ${seatOrdersData.length + 1} Coupon Batches seeded successfully`);
}
