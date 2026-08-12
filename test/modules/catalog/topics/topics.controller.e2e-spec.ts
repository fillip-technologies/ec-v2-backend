import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('TopicsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdTopicId: number;

  const testSlug = `topic-test-${Date.now()}`;

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
        email: `topic.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Topic',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/topics - should return list of topics', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/topics')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /catalog/topics - should create a new topic under cluster 1', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/topics')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        clusterId: 1,
        slug: testSlug,
        name: 'Automated Test Topic',
        isActive: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.slug).toBe(testSlug);
    createdTopicId = response.body.id;
  });

  it('PATCH /catalog/topics/:id - should update existing topic', async () => {
    const updatedName = 'Updated Test Topic Name';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/topics/${createdTopicId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        name: updatedName,
      })
      .expect(200);

    expect(response.body.id).toBe(createdTopicId);
    expect(response.body.name).toBe(updatedName);
  });

  it('DELETE /catalog/topics/:id - should delete topic by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/topics/${createdTopicId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
