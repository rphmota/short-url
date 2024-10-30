import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('URL Shortener E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/urls (POST) - should create a short URL', async () => {
    const response = await request(app.getHttpServer())
      .post('/urls')
      .send({ original_url: 'https://example.com' })
      .expect(201);

    expect(response.body).toHaveProperty('short_url');
    expect(typeof response.body.short_url).toBe('string');
  });

  it('/urls/:shortCode (GET) - should redirect to original URL', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/urls')
      .send({ original_url: 'https://example.com' })
      .expect(201);

    const shortUrl = createResponse.body.short_url;
    const shortCode = shortUrl.split('/').pop();

    const redirectResponse = await request(app.getHttpServer())
      .get(`/urls/${shortCode}`)
      .expect(302);

    expect(redirectResponse.headers.location).toBe('https://example.com');
  });
});
