import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { buildPaginatedResult } from '../../core/dto/pagination.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/analytics/overview
   * Fast executive intelligence: Top KPIs, 12-month revenue trend, 4-stage funnel, top programs, AI score spread
   */
  async getOverviewAnalytics() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [
      b2cRevenueAgg,
      b2bRevenueAgg,
      recentPaidOrders,
      recentPaidSeatOrders,
      totalRegisteredStudents,
      totalPartnerColleges,
      totalSeatPurchasedAgg,
      totalRedeemedCoupons,
      totalSubmissions,
      passedSubmissions,
      needsWorkSubmissions,
      evaluatingSubmissions,
      allAiReviews,
      enrolledStudentsCount,
      completedStudentCount,
      certifiedStudentCount,
      programsWithEnrollments,
    ] = await Promise.all([
      // 1. Financial KPIs
      this.prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      this.prisma.seatOrder.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      this.prisma.order.findMany({
        where: { status: 'PAID', createdAt: { gte: twelveMonthsAgo } },
        select: { amount: true, createdAt: true },
      }),
      this.prisma.seatOrder.findMany({
        where: { status: 'PAID', createdAt: { gte: twelveMonthsAgo } },
        select: { amount: true, createdAt: true },
      }),

      // 2. Entity Counts
      this.prisma.student.count(),
      this.prisma.college.count(),
      this.prisma.seatOrder.aggregate({
        _sum: { seatsPurchased: true },
        where: { status: 'PAID' },
      }),
      this.prisma.coupon.count({
        where: { status: 'REDEEMED' },
      }),

      // 3. AI Evaluations
      this.prisma.submission.count(),
      this.prisma.submission.count({
        where: { status: 'PASSED' },
      }),
      this.prisma.submission.count({
        where: { status: 'NEEDS_WORK' },
      }),
      this.prisma.submission.count({
        where: { status: 'EVALUATING' },
      }),
      this.prisma.aiReview.findMany({
        select: { score: true, maxScore: true },
      }),

      // 4. Learning Funnel Counts
      this.prisma.enrollment
        .groupBy({
          by: ['studentId'],
        })
        .then((res) => res.length),
      this.prisma.enrollment.count({
        where: { status: 'COMPLETED' },
      }),
      this.prisma.certificate
        .groupBy({
          by: ['studentId'],
        })
        .then((res) => res.length),

      // 5. Program Breakdown
      this.prisma.program.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

    // 12-Month Revenue Rolling Curve
    const monthsMap: Record<string, { month: string; b2c: number; b2b: number; total: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthsMap[key] = { month: key, b2c: 0, b2b: 0, total: 0 };
    }

    recentPaidOrders.forEach((order) => {
      const key = new Date(order.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthsMap[key]) {
        const amt = Number(order.amount) || 0;
        monthsMap[key].b2c += amt;
        monthsMap[key].total += amt;
      }
    });

    recentPaidSeatOrders.forEach((seatOrder) => {
      const key = new Date(seatOrder.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (monthsMap[key]) {
        const amt = Number(seatOrder.amount) || 0;
        monthsMap[key].b2b += amt;
        monthsMap[key].total += amt;
      }
    });

    const revenueTrends = Object.values(monthsMap);

    // AI Rubric Score Distribution
    let distinctionCount = 0; // 90-100%
    let firstClassCount = 0;  // 75-89%
    let passGradeCount = 0;   // 60-74%
    let needsWorkCount = 0;   // < 60%
    let totalScoreSum = 0;

    allAiReviews.forEach((review) => {
      const score = Number(review.score) || 0;
      const maxScore = Number(review.maxScore) || 100;
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

      totalScoreSum += percentage;

      if (percentage >= 90) distinctionCount++;
      else if (percentage >= 75) firstClassCount++;
      else if (percentage >= 60) passGradeCount++;
      else needsWorkCount++;
    });

    const totalGradedReviews = allAiReviews.length || 1;
    const avgRubricScore = Math.round((totalScoreSum / totalGradedReviews) * 10) / 10;

    const totalB2CRevenue = Number(b2cRevenueAgg._sum.amount) || 0;
    const totalB2BRevenue = Number(b2bRevenueAgg._sum.amount) || 0;
    const totalRevenue = totalB2CRevenue + totalB2BRevenue;
    const totalSeats = Number(totalSeatPurchasedAgg._sum.seatsPurchased) || 0;
    const totalRedeemed = totalRedeemedCoupons || 0;

    return {
      kpis: {
        totalRevenue,
        b2cRevenue: totalB2CRevenue,
        b2bRevenue: totalB2BRevenue,
        b2cPercentage: totalRevenue > 0 ? Math.round((totalB2CRevenue / totalRevenue) * 100) : 0,
        b2bPercentage: totalRevenue > 0 ? Math.round((totalB2BRevenue / totalRevenue) * 100) : 0,
        activeInterns: totalRegisteredStudents,
        partnerColleges: totalPartnerColleges,
        totalSeatsSold: totalSeats,
        seatUtilizationPercentage: totalSeats > 0 ? Math.round((totalRedeemed / totalSeats) * 100) : 0,
        aiEvaluations: {
          total: totalSubmissions,
          passed: passedSubmissions,
          passedPercentage: totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 1000) / 10 : 0,
          needsWork: needsWorkSubmissions,
          needsWorkPercentage: totalSubmissions > 0 ? Math.round((needsWorkSubmissions / totalSubmissions) * 1000) / 10 : 0,
          evaluating: evaluatingSubmissions,
        },
      },
      revenueTrends,
      learningFunnel: [
        { stage: 'Registered Students', count: totalRegisteredStudents, conversionPct: 100 },
        {
          stage: 'Enrolled Students',
          count: enrolledStudentsCount,
          conversionPct:
            totalRegisteredStudents > 0
              ? Math.round((enrolledStudentsCount / totalRegisteredStudents) * 1000) / 10
              : 0,
        },
        {
          stage: 'Completed Capstone',
          count: completedStudentCount,
          conversionPct:
            enrolledStudentsCount > 0
              ? Math.round((completedStudentCount / enrolledStudentsCount) * 1000) / 10
              : 0,
        },
        {
          stage: 'Certified Students',
          count: certifiedStudentCount,
          conversionPct:
            completedStudentCount > 0
              ? Math.round((certifiedStudentCount / completedStudentCount) * 1000) / 10
              : 0,
        },
      ],
      programPopularity: programsWithEnrollments.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        enrolledCount: p._count.enrollments,
        sharePct:
          enrolledStudentsCount > 0
            ? Math.round((p._count.enrollments / enrolledStudentsCount) * 1000) / 10
            : 0,
      })),
      aiRubricQuality: {
        totalEvaluated: allAiReviews.length,
        avgScore: avgRubricScore,
        avgLatencySeconds: 2.8,
        distribution: [
          {
            label: 'Distinction (90 - 100%)',
            count: distinctionCount,
            pct: totalGradedReviews > 0 ? Math.round((distinctionCount / totalGradedReviews) * 100) : 0,
          },
          {
            label: 'First Class (75 - 89%)',
            count: firstClassCount,
            pct: totalGradedReviews > 0 ? Math.round((firstClassCount / totalGradedReviews) * 100) : 0,
          },
          {
            label: 'Pass Grade (60 - 74%)',
            count: passGradeCount,
            pct: totalGradedReviews > 0 ? Math.round((passGradeCount / totalGradedReviews) * 100) : 0,
          },
          {
            label: 'Needs Work (< 60%)',
            count: needsWorkCount,
            pct: totalGradedReviews > 0 ? Math.round((needsWorkCount / totalGradedReviews) * 100) : 0,
          },
        ],
      },
    };
  }

  /**
   * GET /admin/analytics/colleges
   * Paginated, searchable & fast B2B institutional cohort benchmarks
   */
  async getCollegeBenchmarks(params?: { page?: number; limit?: number; search?: string }) {
    const where: any = {};
    if (params?.search && params.search.trim()) {
      where.name = { contains: params.search.trim() };
    }

    const pageNum = Math.max(1, Number(params?.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(params?.limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, colleges] = await Promise.all([
      this.prisma.college.count({ where }),
      this.prisma.college.findMany({
        where,
        take: limitNum,
        skip,
        include: {
          seatOrders: { where: { status: 'PAID' } },
          couponBatches: {
            include: {
              coupons: { select: { status: true } },
            },
          },
          students: {
            include: {
              certificates: true,
              submissions: {
                include: { aiReview: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mapped = colleges.map((c) => {
      const seatsBought = c.seatOrders.reduce((sum, so) => sum + (so.seatsPurchased || 0), 0);
      const totalRevenue = c.seatOrders.reduce((sum, so) => sum + Number(so.amount || 0), 0);

      let redeemedSeats = c.seatOrders.reduce((sum, so) => sum + (so.seatsRedeemed || 0), 0);
      if (redeemedSeats === 0 && c.couponBatches) {
        c.couponBatches.forEach((cb) => {
          redeemedSeats += cb.coupons?.filter((cp) => cp.status === 'REDEEMED').length || 0;
        });
      }

      const seatUtilizationPct = seatsBought > 0 ? Math.round((redeemedSeats / seatsBought) * 100) : 0;

      let certCount = 0;
      let totalStudentScore = 0;
      let gradedSubmissionsCount = 0;

      c.students.forEach((s) => {
        certCount += s.certificates?.length || 0;
        s.submissions?.forEach((sub) => {
          if (sub.aiReview?.score !== undefined && sub.aiReview?.score !== null) {
            totalStudentScore += Number(sub.aiReview.score);
            gradedSubmissionsCount++;
          }
        });
      });

      const avgScore =
        gradedSubmissionsCount > 0
          ? Math.round((totalStudentScore / gradedSubmissionsCount) * 10) / 10
          : 0;

      return {
        id: c.id,
        name: c.name,
        seatsBought,
        redeemedSeats,
        seatUtilizationPct,
        avgScore,
        certCount,
        totalRevenue,
      };
    });

    return buildPaginatedResult(mapped, total, pageNum, limitNum);
  }

  /**
   * GET /admin/analytics/geographic
   * Bounded and sorted global student & visitor distribution
   */
  async getGeographicReach() {
    const countries = await this.prisma.country.findMany({
      include: {
        _count: { select: { users: true } },
      },
      orderBy: {
        users: {
          _count: 'desc',
        },
      },
    });

    const totalUsersWithCountry = countries.reduce(
      (sum, c) => sum + (c._count?.users || 0),
      0,
    );

    return countries.map((c) => {
      const userCount = c._count?.users || 0;
      const sharePct =
        totalUsersWithCountry > 0
          ? Math.min(100, Math.round((userCount / totalUsersWithCountry) * 100))
          : 0;

      return {
        countryName: c.name,
        isoCode: c.isoCode,
        currencyCode: c.currencyCode,
        studentCount: userCount,
        sharePct,
      };
    });
  }

  /**
   * Combined legacy analytics payload (for single-call backward compatibility)
   */
  async getAnalytics() {
    const [overview, collegeResult, geographicReach] = await Promise.all([
      this.getOverviewAnalytics(),
      this.getCollegeBenchmarks({ page: 1, limit: 10 }),
      this.getGeographicReach(),
    ]);

    return {
      ...overview,
      collegeBenchmarks: collegeResult.data,
      collegeBenchmarksMeta: collegeResult.meta,
      geographicReach,
    };
  }
}
