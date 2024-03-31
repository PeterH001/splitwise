import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { todo } from 'node:test';

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init;
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Sign up', () => {
      it.todo('Should sign up')
    });
    describe('Sign in', () => {});
  });
  describe('User', () => {
    describe('Get me', () => {});
    describe('Get users', () => {});
    describe('Edit user', () => {});
    describe('Delete user by id', () => {});
  });
  describe('Group', () => {
    describe('Get groups', () => {});
    describe('Get group by id', () => {});
    describe('Edit group', () => {});
    describe('Delete group', () => {});
    
  });
  describe('Expense', () => {});
  describe('Debt', () => {});
});
