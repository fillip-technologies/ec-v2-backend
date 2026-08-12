import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('ProgramsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdProgramId: number;
  let createdPricingId: number;

  const testSlug = `program-test-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/register/student')
      .send({
        email: `program.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Program',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/programs - should return list of programs', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/programs')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /catalog/programs - should create a new program with topics, tech, and pricings', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/programs')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        countryId: 1,
        title: 'Automated Test Program',
        slug: testSlug,
        description: 'Test program created during e2e testing',
        durationHours: 60,
        topicIds: [1],
        technologyIds: [1, 2],
        pricings: [
          {
            countryId: 1,
            currency: 'INR',
            amount: 2999.0,
            isActive: true,
          },
        ],
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe(testSlug);
    expect(Array.isArray(response.body.pricings)).toBe(true);
    expect(response.body.pricings.length).toBeGreaterThan(0);

    createdProgramId = response.body.id;
    createdPricingId = response.body.pricings[0].id;
  });

  it('GET /catalog/programs/:idOrSlug - should fetch program by ID or slug', async () => {
    const response = await request(app.getHttpServer())
      .get(`/catalog/programs/${testSlug}`)
      .expect(200);

    expect(response.body.id).toBe(createdProgramId);
    expect(response.body.slug).toBe(testSlug);
  });

  it('PATCH /catalog/programs/:id - should update program details', async () => {
    const updatedTitle = 'Updated Automated Test Program Title';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: updatedTitle,
        durationHours: 90,
      })
      .expect(200);

    expect(response.body.id).toBe(createdProgramId);
    expect(response.body.title).toBe(updatedTitle);
    expect(response.body.durationHours).toBe(90);
  });

  it('POST /catalog/programs/:id/pricing - should add a new pricing option', async () => {
    const response = await request(app.getHttpServer())
      .post(`/catalog/programs/${createdProgramId}/pricing`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        countryId: 1,
        currency: 'USD',
        amount: 49.0,
        isActive: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.currency).toBe('USD');
  });

  it('PATCH /catalog/programs/pricing/:pricingId - should update pricing option', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/catalog/programs/pricing/${createdPricingId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        amount: 3499.0,
      })
      .expect(200);

    expect(response.body.id).toBe(createdPricingId);
  });

  it('DELETE /catalog/programs/pricing/:pricingId - should delete pricing option', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/programs/pricing/${createdPricingId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('DELETE /catalog/programs/:id - should delete program by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/programs/${createdProgramId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
