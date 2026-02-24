import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

import { buildGlobalValidationPipe } from './../src/core/pipes/app-validation.pipe';

describe('Debug Order Flow (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;
    const uniqueId = Date.now();
    const testUser = {
        email: `debug-user-${uniqueId}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Debug',
        lastName: 'User',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication({ logger: ['error', 'warn', 'log', 'debug'] });
        app.useGlobalPipes(buildGlobalValidationPipe());

        // Add global filter to log everything
        app.useGlobalFilters({
            catch(exception, host) {
                const ctx = host.switchToHttp();
                const response = ctx.getResponse();
                console.error('GLOBAL FILTER CAUGHT:', exception);
                if (response.status) {
                    response.status(500).json({ statusCode: 500, message: 'Internal server error from filter' });
                } else {
                    // Fastify/Express difference, just let it fail or try generic
                    try { response.status(500).send({ message: 'Internal error' }); } catch { }
                }
            }
        } as any);

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Setup: Register and Login', async () => {
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(201);

        jwtToken = res.body.accessToken;
        console.log('JWT Token acquired');
    });

    it('Step 1: Get Initial Balance', async () => {
        const res = await request(app.getHttpServer())
            .get('/wallet/portfolio')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);
        console.log('Initial Portfolio:', JSON.stringify(res.body));
    });

    it('Step 1.5: Deposit Funds', async () => {
        await request(app.getHttpServer())
            .post('/wallet/deposit')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ amount: 10000, currency: 'USD' })
            .expect(201);
        console.log('Funds deposited');
    });

    it('Step 2: Place Order', async () => {
        const orderPayload = {
            symbol: 'BTC',
            type: 'LIMIT',
            side: 'BUY',
            amount: 0.1,
            price: 1000
        };

        const res = await request(app.getHttpServer())
            .post('/trade/order')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(orderPayload);

        console.log('Place Order Response:', res.status, JSON.stringify(res.body));

        if (res.status !== 201) {
            throw new Error(`Failed to place order: ${JSON.stringify(res.body)}`);
        }
        expect(res.body).toHaveProperty('id');
    });

    it('Step 3: Get Orders', async () => {
        const res = await request(app.getHttpServer())
            .get('/trade/orders')
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect(200);

        console.log('Get Orders Response:', JSON.stringify(res.body));
        expect(res.body.length).toBeGreaterThan(0);
    });
});
