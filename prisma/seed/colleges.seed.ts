import { PrismaClient } from '@prisma/client';

export async function seedColleges(prisma: PrismaClient) {
  console.log('🏫 [3/7] Seeding Prominent Universities & Institutional Partners...');

  const colleges = [
    {
      id: 1,
      name: 'Vellore Institute of Technology (VIT)',
      address: 'Vellore Campus, Tiruvalam Rd, Katpadi, Vellore, Tamil Nadu 632014',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 2,
      name: 'Indian Institute of Technology (IIT) Madras',
      address: 'IIT P.O., Sardar Patel Road, Adyar, Chennai, Tamil Nadu 600036',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 3,
      name: 'Birla Institute of Technology and Science (BITS) Pilani',
      address: 'Vidya Vihar Campus, Pilani, Rajasthan 333031',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 4,
      name: 'Delhi Technological University (DTU)',
      address: 'Shahbad Daulatpur, Main Bawana Road, Rohini, Delhi 110042',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 5,
      name: 'National Institute of Technology Karnataka (NITK) Surathkal',
      address: 'NH 66, Srinivasnagar, Surathkal, Mangalore, Karnataka 575025',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 6,
      name: 'RV College of Engineering (RVCE)',
      address: 'Mysore Road, RV Vidyanikethan Post, Bengaluru, Karnataka 560059',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 7,
      name: 'Manipal Institute of Technology (MIT)',
      address: 'Udupi - Karkala Rd, Eshwar Nagar, Manipal, Karnataka 576104',
      countryId: 1,
      status: 'approved',
    },
    {
      id: 8,
      name: 'SRM Institute of Science and Technology',
      address: 'SRM Nagar, Kattankulathur, Kanchipuram, Tamil Nadu 603203',
      countryId: 1,
      status: 'pending',
    },
    {
      id: 9,
      name: 'Thapar Institute of Engineering and Technology',
      address: 'Bhadson Road, Adarsh Nagar, Patiala, Punjab 147004',
      countryId: 1,
      status: 'pending',
    },
    {
      id: 10,
      name: 'Apex Academy of Technology & Research',
      address: 'Sector 62, Industrial Area, Noida, Uttar Pradesh 201309',
      countryId: 1,
      status: 'rejected',
    },
  ];

  for (const col of colleges) {
    await prisma.college.upsert({
      where: { name: col.name },
      update: {
        address: col.address,
        countryId: col.countryId,
        status: col.status,
      },
      create: {
        name: col.name,
        address: col.address,
        countryId: col.countryId,
        status: col.status,
      },
    });
  }

  console.log(`  ✅ ${colleges.length} University Institutions seeded successfully`);
}
