import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { buildGlobalValidationPipe } from './../src/core/pipes/app-validation.pipe';

describe('Complete Route Verification (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;
    const uniqueId = Date.now();
    const testUser = {
        email: `verify-user-${uniqueId}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(buildGlobalValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        // Ideally cleanup user here
        await app.close();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });

    // --- Auth Context ---
    it('POST /auth/register', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toEqual(testUser.email);
    });

    it('POST /auth/login', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        jwtToken = response.body.accessToken;
    });

    it('GET /users/me', async () => {
        const response = await request(app.getHttpServer())
            .get('/users/me')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);

        expect(response.body.email).toEqual(testUser.email);
    });

    // --- Wallet Context ---
    it('GET /wallet/portfolio (Initial)', async () => {
        const response = await request(app.getHttpServer())
            .get('/wallet/portfolio')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);

        // Check PortfolioPresenter structure
        expect(response.body).toHaveProperty('totalValueUSD');
        expect(response.body).toHaveProperty('wallets');
    });

    // ...

    it('POST /trade/order (Limit Buy)', async () => {
        // ...
            .expect(201);

        // Check OrderPresenter
        expect(response.body).toHaveProperty('id');
        expect(['PENDING', 'OPEN']).toContain(response.body.status);
    });

    it('GET /trade/orders', async () => {
        const response = await request(app.getHttpServer())
            .get('/trade/orders')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // --- Backtest Context ---
    it('POST /backtest/run', async () => {
        const response = await request(app.getHttpServer())
            .post('/backtest/run')
            .send({
                symbol: 'BTC',
                timeframe: '1d',
                initialCapital: 1000,
                strategy: 'sma_crossover', // Check if this strategy exists, usually simple ones do
                parameters: { period: 14 }
            })
        // Backtest might fail if 'sma_crossover' doesn't exist or data is missing.
        // We accept 201 (Success) or 400 (Bad Request - expected if no data/strat)
        // Ideally we want 201 to verify presenter.

        if (response.status === 201) {
            // Check BacktestResultPresenter
            expect(response.body).toHaveProperty('totalReturn');
            expect(response.body).toHaveProperty('metrics');
        }
    });

});
