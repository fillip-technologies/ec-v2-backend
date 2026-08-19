import { prisma, disconnectPrisma } from './client';
import { seedCountriesAndGateways } from './countries.seed';
import { seedRolesAndPermissions } from './roles-permissions.seed';
import { seedColleges } from './colleges.seed';
import { seedUsers } from './users.seed';
import { seedCatalog } from './catalog.seed';
import { seedB2BSeatsAndCoupons } from './b2b-seats-coupons.seed';
import { seedEnrollmentsAndDeliverables } from './enrollments-deliverables.seed';

async function main() {
  console.log('\n=============================================================');
  console.log('🚀 ENGINEERS CLINIC — ENTERPRISE DATABASE SEEDING SUITE');
  console.log('=============================================================\n');

  const startTime = Date.now();

  try {
    // 1. Countries & Payment Gateway Configurations
    await seedCountriesAndGateways(prisma);

    // 2. Roles, Permissions & RBAC Matrix
    await seedRolesAndPermissions(prisma);

    // 3. Universities & Institutional Partners
    await seedColleges(prisma);

    // 4. Platform Users (Super Admins, Admins, Deans, Students, Support)
    await seedUsers(prisma);

    // 5. Academic Curriculum, Topics, Technologies, Capstone Programs & Rubrics
    await seedCatalog(prisma);

    // 6. Institutional B2B Seat Purchases & Coupon Batches
    await seedB2BSeatsAndCoupons(prisma);

    // 7. Complete Real-World Lifecycle (Orders, Workspaces, Submissions, AI Reviews, Certificates)
    await seedEnrollmentsAndDeliverables(prisma);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n=============================================================');
    console.log(`✨ DATABASE SEEDING COMPLETED SUCCESSFULLY IN ${elapsed}s`);
    console.log('=============================================================\n');
  } catch (error) {
    console.error('\n❌ DATABASE SEEDING FAILED:', error);
    process.exit(1);
  } finally {
    await disconnectPrisma();
  }
}

main();
