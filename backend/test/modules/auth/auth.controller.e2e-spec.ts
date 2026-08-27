import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let studentJwtToken: string;
  let collegeJwtToken: string;

  const testStudentEmail = `test.student.${Date.now()}@example.com`;
  const testCollegeEmail = `test.college.${Date.now()}@vit.ac.in`;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register/student - should register a new student', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register/student')
      .send({
        email: testStudentEmail,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Rahul',
        lastName: 'Sharma',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testStudentEmail);
    studentJwtToken = response.body.accessToken;
  });

  it('POST /auth/register/college - should register a new college admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register/college')
      .send({
        email: testCollegeEmail,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        collegeName: `VIT Campus ${Date.now()}`,
        address: 'Katpadi, Vellore, Tamil Nadu',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testCollegeEmail);
    collegeJwtToken = response.body.accessToken;
  });

  it('POST /auth/login - should authenticate student user and return token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testStudentEmail,
        password: 'Password@123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe(testStudentEmail);
    studentJwtToken = response.body.accessToken;
  });

  it('GET /auth/profile - should return current authenticated user profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${studentJwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(testStudentEmail);
    expect(response.body).toHaveProperty('student');
  });

  it('GET /auth/profile - should fail with 401 Unauthorized without Bearer token', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });
});
