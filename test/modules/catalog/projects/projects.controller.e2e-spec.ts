import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdProjectId: number;

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
        email: `catalog.project.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Project',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/projects - should return list of projects', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/projects')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /catalog/projects - should create a new project linked to program 1', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/projects')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        programId: 1,
        title: 'Catalog E2E Test Project',
        description: 'Test project description created during catalog e2e testing',
        orderIndex: 2,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Catalog E2E Test Project');
    createdProjectId = response.body.id;
  });

  it('GET /catalog/projects/:id - should fetch single project details by ID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/catalog/projects/${createdProjectId}`)
      .expect(200);

    expect(response.body.id).toBe(createdProjectId);
  });

  it('PATCH /catalog/projects/:id - should update project details', async () => {
    const updatedTitle = 'Updated Catalog E2E Test Project Title';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: updatedTitle,
      })
      .expect(200);

    expect(response.body.id).toBe(createdProjectId);
    expect(response.body.title).toBe(updatedTitle);
  });

  it('DELETE /catalog/projects/:id - should delete project by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
