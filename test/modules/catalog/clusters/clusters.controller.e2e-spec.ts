import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('ClustersController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdClusterId: number;

  const testSlug = `cluster-test-${Date.now()}`;

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
        email: `cluster.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Cluster',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/clusters - should return list of clusters', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/clusters')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /catalog/clusters - should create a new cluster', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/clusters')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        slug: testSlug,
        name: 'Automated Test Cluster',
        description: 'Cluster created during automated e2e testing',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe(testSlug);
    createdClusterId = response.body.id;
  });

  it('PATCH /catalog/clusters/:id - should update existing cluster', async () => {
    const updatedName = 'Updated Test Cluster Name';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/clusters/${createdClusterId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body.id).toBe(createdClusterId);
    expect(response.body.name).toBe(updatedName);
  });

  it('DELETE /catalog/clusters/:id - should delete cluster by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/clusters/${createdClusterId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
