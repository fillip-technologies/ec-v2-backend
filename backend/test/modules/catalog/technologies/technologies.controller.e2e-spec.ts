import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('TechnologiesController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdTechId: number;

  const testSlug = `tech-test-${Date.now()}`;

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
        email: `tech.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Tech',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/technologies - should return list of active technologies', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/technologies')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /catalog/technologies - should create a new technology', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/technologies')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        slug: testSlug,
        name: 'Automated Test Technology',
        isActive: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe(testSlug);
    createdTechId = response.body.id;
  });

  it('PATCH /catalog/technologies/:id - should update existing technology', async () => {
    const updatedName = 'Updated Test Technology Name';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/technologies/${createdTechId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body.id).toBe(createdTechId);
    expect(response.body.name).toBe(updatedName);
  });

  it('DELETE /catalog/technologies/:id - should delete technology by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/technologies/${createdTechId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
