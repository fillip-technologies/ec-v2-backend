import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 [4/7] Seeding Platform Personas, Coordinators & Student Cohorts...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);

  // 1. Super Admins & Platform Leadership
  const superAdmins = [
    {
      id: 1,
      email: 'admin@engineersclinic.com',
      phoneNo: '+91 9876543210',
      roleId: 1, // super_admin
      countryId: 1,
      status: 'active',
    },
    {
      id: 2,
      email: 'chief.architect@engineersclinic.com',
      phoneNo: '+91 9876543211',
      roleId: 1, // super_admin
      countryId: 1,
      status: 'active',
    },
  ];

  for (const u of superAdmins) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
      create: {
        email: u.email,
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
    });
  }

  // 2. Operations & Curriculum Admins
  const opsAdmins = [
    {
      email: 'ops.lead@engineersclinic.com',
      phoneNo: '+91 9876543212',
      roleId: 2, // admin
      countryId: 1,
      status: 'active',
    },
    {
      email: 'curriculum.director@engineersclinic.com',
      phoneNo: '+91 9876543213',
      roleId: 2, // admin
      countryId: 1,
      status: 'active',
    },
  ];

  for (const u of opsAdmins) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
      create: {
        email: u.email,
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
    });
  }

  // 3. Support Specialists
  const supportUsers = [
    {
      email: 'support@engineersclinic.com',
      phoneNo: '+91 9876543214',
      roleId: 5, // support
      countryId: 1,
      status: 'active',
    },
    {
      email: 'helpdesk@engineersclinic.com',
      phoneNo: '+91 9876543215',
      roleId: 5, // support
      countryId: 1,
      status: 'active',
    },
  ];

  for (const u of supportUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
      create: {
        email: u.email,
        password: defaultPassword,
        phoneNo: u.phoneNo,
        roleId: u.roleId,
        countryId: u.countryId,
        status: u.status,
      },
    });
  }

  // 4. College Institutional Deans & Placement Officers
  const collegeCoordinators = [
    {
      email: 'admin@vit.ac.in',
      phoneNo: '+91 9840123456',
      collegeName: 'Vellore Institute of Technology (VIT)',
    },
    {
      email: 'dean.placements@iitm.ac.in',
      phoneNo: '+91 9444123456',
      collegeName: 'Indian Institute of Technology (IIT) Madras',
    },
    {
      email: 'hod.cs@bitspilani.ac.in',
      phoneNo: '+91 9988123456',
      collegeName: 'Birla Institute of Technology and Science (BITS) Pilani',
    },
    {
      email: 'placements@dtu.ac.in',
      phoneNo: '+91 9811123456',
      collegeName: 'Delhi Technological University (DTU)',
    },
    {
      email: 'internships@nitk.edu.in',
      phoneNo: '+91 9480123456',
      collegeName: 'National Institute of Technology Karnataka (NITK) Surathkal',
    },
    {
      email: 'coordinator@rvce.edu.in',
      phoneNo: '+91 9845123456',
      collegeName: 'RV College of Engineering (RVCE)',
    },
    {
      email: 'industry.cell@manipal.edu',
      phoneNo: '+91 9880123456',
      collegeName: 'Manipal Institute of Technology (MIT)',
    },
  ];

  for (const c of collegeCoordinators) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        password: defaultPassword,
        phoneNo: c.phoneNo,
        roleId: 3, // college
        countryId: 1,
        status: 'active',
      },
      create: {
        email: c.email,
        password: defaultPassword,
        phoneNo: c.phoneNo,
        roleId: 3, // college
        countryId: 1,
        status: 'active',
      },
    });

    const college = await prisma.college.findFirst({ where: { name: c.collegeName } });
    if (college) {
      await prisma.collegeMember.upsert({
        where: { userId: user.id },
        update: { collegeId: college.id },
        create: { userId: user.id, collegeId: college.id },
      });
    }
  }

  // 5. Authentic Student Cohorts
  const studentsData = [
    {
      email: 'student@example.com',
      phoneNo: '+91 9123456780',
      firstName: 'Rahul',
      lastName: 'Sharma',
      collegeName: 'Vellore Institute of Technology (VIT)',
      customCollegeName: null,
      usn: '22BCE1048',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'priya.patel@vit.ac.in',
      phoneNo: '+91 9123456781',
      firstName: 'Priya',
      lastName: 'Patel',
      collegeName: 'Vellore Institute of Technology (VIT)',
      customCollegeName: null,
      usn: '22BDS0412',
      branch: 'Artificial Intelligence & Data Science',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'arjun.nair@iitm.ac.in',
      phoneNo: '+91 9123456782',
      firstName: 'Arjun',
      lastName: 'Nair',
      collegeName: 'Indian Institute of Technology (IIT) Madras',
      customCollegeName: null,
      usn: 'CS21B045',
      branch: 'Computer Science & Engineering',
      graduationYear: 2025,
      status: 'active',
    },
    {
      email: 'ananya.sen@bitspilani.ac.in',
      phoneNo: '+91 9123456783',
      firstName: 'Ananya',
      lastName: 'Sen',
      collegeName: 'Birla Institute of Technology and Science (BITS) Pilani',
      customCollegeName: null,
      usn: '2022A7PS0198P',
      branch: 'Electrical & Electronics Engineering',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'karthik.rajan@dtu.ac.in',
      phoneNo: '+91 9123456784',
      firstName: 'Karthik',
      lastName: 'Rajan',
      collegeName: 'Delhi Technological University (DTU)',
      customCollegeName: null,
      usn: '2K22/IT/84',
      branch: 'Information Technology',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'neha.kulkarni@nitk.edu.in',
      phoneNo: '+91 9123456785',
      firstName: 'Neha',
      lastName: 'Kulkarni',
      collegeName: 'National Institute of Technology Karnataka (NITK) Surathkal',
      customCollegeName: null,
      usn: '211CS142',
      branch: 'Computer Science & Engineering',
      graduationYear: 2025,
      status: 'active',
    },
    {
      email: 'sidharth.menon@rvce.edu.in',
      phoneNo: '+91 9123456786',
      firstName: 'Sidharth',
      lastName: 'Menon',
      collegeName: 'RV College of Engineering (RVCE)',
      customCollegeName: null,
      usn: '1RV22EC098',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'tanvi.sharma@manipal.edu',
      phoneNo: '+91 9123456787',
      firstName: 'Tanvi',
      lastName: 'Sharma',
      collegeName: 'Manipal Institute of Technology (MIT)',
      customCollegeName: null,
      usn: '220905312',
      branch: 'Robotics & Automation',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'rohit.verma@gmail.com',
      phoneNo: '+91 9123456788',
      firstName: 'Rohit',
      lastName: 'Verma',
      collegeName: null,
      customCollegeName: 'PES University Bangalore',
      usn: 'PES1UG22CS450',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      status: 'active',
    },
    {
      email: 'sneha.reddy@yahoo.com',
      phoneNo: '+91 9123456789',
      firstName: 'Sneha',
      lastName: 'Reddy',
      collegeName: null,
      customCollegeName: 'Chitkara University',
      usn: '2210990432',
      branch: 'Information Technology',
      graduationYear: 2027,
      status: 'pending',
    },
    {
      email: 'vikram.malhotra@outlook.com',
      phoneNo: '+91 9123456790',
      firstName: 'Vikram',
      lastName: 'Malhotra',
      collegeName: 'Vellore Institute of Technology (VIT)',
      customCollegeName: null,
      usn: '22BME0341',
      branch: 'Mechanical Engineering',
      graduationYear: 2026,
      status: 'disabled',
    },
  ];

  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        password: defaultPassword,
        phoneNo: s.phoneNo,
        roleId: 4, // student
        countryId: 1,
        status: s.status,
      },
      create: {
        email: s.email,
        password: defaultPassword,
        phoneNo: s.phoneNo,
        roleId: 4, // student
        countryId: 1,
        status: s.status,
      },
    });

    let collegeId: number | null = null;
    if (s.collegeName) {
      const col = await prisma.college.findFirst({ where: { name: s.collegeName } });
      if (col) collegeId = col.id;
    }

    await prisma.student.upsert({
      where: { userid: user.id },
      update: {
        firstName: s.firstName,
        lastName: s.lastName,
        collegeId: collegeId,
        customCollegeName: s.customCollegeName,
        usn: s.usn,
        branch: s.branch,
        graduationYear: s.graduationYear,
      },
      create: {
        userid: user.id,
        firstName: s.firstName,
        lastName: s.lastName,
        collegeId: collegeId,
        customCollegeName: s.customCollegeName,
        usn: s.usn,
        branch: s.branch,
        graduationYear: s.graduationYear,
      },
    });
  }

  console.log(`  ✅ 4 Admins, 2 Support, ${collegeCoordinators.length} College Deans & ${studentsData.length} Students seeded successfully`);
}
