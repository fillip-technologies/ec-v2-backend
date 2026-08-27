import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../src/app.module';

describe('ProgramsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdProgramId: number;
  let createdPricingId: number;

  const testSlug = `test-program-slug-${Date.now()}`;

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
      .post('/auth/login')
      .send({
        email: 'admin@engineersclinic.com',
        password: 'Password@123',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/programs - should return list of programs with projects & templates', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/programs')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('projects');
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

  it('GET /catalog/programs/:idOrSlug - should fetch program by ID or slug with projects, workspaceTemplates, steps, tasks & resources', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/programs/1')
      .expect(200);

    expect(response.body.id).toBe(1);
    expect(Array.isArray(response.body.projects)).toBe(true);
    expect(response.body.projects.length).toBeGreaterThan(0);

    const project = response.body.projects[0];
    expect(project).toHaveProperty('workspaceTemplate');
    expect(project.workspaceTemplate).toHaveProperty('steps');
    expect(Array.isArray(project.workspaceTemplate.steps)).toBe(true);
    expect(project.workspaceTemplate.steps.length).toBeGreaterThan(0);

    const step = project.workspaceTemplate.steps[0];
    expect(step).toHaveProperty('tasks');
    expect(Array.isArray(step.tasks)).toBe(true);
    expect(step).toHaveProperty('resources');
    expect(Array.isArray(step.resources)).toBe(true);
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

  it('PATCH /catalog/programs/pricing/:pricingId - should update pricing details', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/catalog/programs/pricing/${createdPricingId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        amount: 3499.0,
      })
      .expect(200);

    expect(response.body.id).toBe(createdPricingId);
  });

  it('DELETE /catalog/programs/pricing/:pricingId - should delete program pricing', async () => {
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
