import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('StudentController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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

    // Login as student user
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'student@example.com',
        password: 'Password@123',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /student/overview - should return 401 Unauthorized when unauthenticated', async () => {
    await request(app.getHttpServer())
      .get('/student/overview')
      .expect(401);
  });

  it('GET /student/overview - should return student progress metrics & project tracks', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/overview')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('programTitle');
    expect(res.body).toHaveProperty('metrics');
    expect(res.body.metrics).toHaveProperty('hoursLogged');
    expect(res.body.metrics).toHaveProperty('completionPercentage');
    expect(res.body.metrics).toHaveProperty('projectsDone');
    expect(res.body.metrics).toHaveProperty('totalProjects');
    expect(res.body).toHaveProperty('projects');
    expect(Array.isArray(res.body.projects)).toBe(true);
  });

  it('GET /student/profile - should return student identity info', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('firstName');
    expect(res.body).toHaveProperty('displayName');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('verificationStatus');
  });

  it('GET /student/workspace - should return active student workspace snapshot', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/workspace')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('selectedProjects');
    expect(Array.isArray(res.body.selectedProjects)).toBe(true);
  });

  it('GET /student/submissions - should list student task submissions', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/submissions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /student/submissions - should submit deliverable and return AI grading evaluation', async () => {
    const res = await request(app.getHttpServer())
      .post('/student/submissions')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        workspaceStepId: 1,
        payloadUrl: 'https://github.com/engineersclinic/capstone-step-1-final',
      })
      .expect(201);

    expect(res.body).toHaveProperty('submissionId');
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('passed');
    expect(res.body).toHaveProperty('aiReview');
  });

  it('GET /student/rubrics - should return step rubrics for student workspace steps', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/rubrics')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /student/certificates - should list student completion certificates', async () => {
    const res = await request(app.getHttpServer())
      .get('/student/certificates')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
