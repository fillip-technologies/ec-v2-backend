import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../../../src/app.module';

describe('TemplatesController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let createdStepId: number;
  let createdTaskId: number;

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
        email: `catalog.template.tester.${Date.now()}@example.com`,
        password: 'Password@123',
        phoneNo: '9876543210',
        countryId: 1,
        firstName: 'Tester',
        lastName: 'Template',
      });
    jwtToken = res.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /catalog/projects/:projectId/template - should fetch workspace template for project 1', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/projects/1/template')
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.projectId).toBe(1);
    expect(Array.isArray(response.body.steps)).toBe(true);
  });

  it('POST /catalog/projects/:projectId/template - should upsert workspace template for project 1', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/projects/1/template')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        version: 1,
        isActive: true,
      })
      .expect(201);

    expect(response.body.projectId).toBe(1);
  });

  it('POST /catalog/templates/steps - should create a new TemplateStep for workspaceTemplate 1', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/templates/steps')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        workspaceTemplateId: 1,
        orderIndex: 4,
        title: 'Catalog E2E Test Step',
        description: 'Step created during catalog e2e testing',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Catalog E2E Test Step');
    createdStepId = response.body.id;
  });

  it('PATCH /catalog/templates/steps/:id - should update TemplateStep title', async () => {
    const updatedTitle = 'Updated Catalog E2E Test Step Title';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/templates/steps/${createdStepId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: updatedTitle,
      })
      .expect(200);

    expect(response.body.id).toBe(createdStepId);
    expect(response.body.title).toBe(updatedTitle);
  });

  it('POST /catalog/templates/tasks - should create a new TemplateTask under created step', async () => {
    const response = await request(app.getHttpServer())
      .post('/catalog/templates/tasks')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        stepId: createdStepId,
        orderIndex: 1,
        title: 'Catalog E2E Test Task',
        description: 'Task created during catalog e2e testing',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Catalog E2E Test Task');
    createdTaskId = response.body.id;
  });

  it('PATCH /catalog/templates/tasks/:id - should update TemplateTask title', async () => {
    const updatedTitle = 'Updated Catalog E2E Test Task Title';
    const response = await request(app.getHttpServer())
      .patch(`/catalog/templates/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        title: updatedTitle,
      })
      .expect(200);

    expect(response.body.id).toBe(createdTaskId);
    expect(response.body.title).toBe(updatedTitle);
  });

  it('DELETE /catalog/templates/tasks/:id - should delete TemplateTask by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/templates/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('DELETE /catalog/templates/steps/:id - should delete TemplateStep by ID', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/catalog/templates/steps/${createdStepId}`)
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });
});
