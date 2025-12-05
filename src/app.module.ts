import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AdminModule, ApplicationModule, AuthModule, ChatModule, CompanyModule, GatewayModule, JobModule, UserModule } from './Modules';
import { CommonModule, OtpCleanupService } from './Common';
import { OtpModel, OtpRepository } from './DB';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';



@Module({
  imports: [
    //---------------------Config---------------------
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? undefined
        : 'config/.env.development',
    }),

  //---------------------Mongoose---------------------
  MongooseModule.forRoot(process.env.MONGO_URI as string, {
    onConnectionCreate: (connection: Connection) => {
      connection.on('connected', () => console.log('MongoDB connected successfully🎉💙'));
    }
  }),
  //---------------------Rate Limiter---------------------
  ThrottlerModule.forRoot({
    throttlers: [
      {
        ttl: 20000,// 20 seconds
        limit: 2,
      },
    ],
  }),
  //---------------------Schedule---------------------
  ScheduleModule.forRoot({}),
  //---------------------GraphQL---------------------
  GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql')
  }),
  //---------------------Moduels---------------------
  // CommonModule,
  OtpModel,
  AuthModule,
  UserModule,
  CompanyModule,
  AdminModule,
  JobModule,
  ApplicationModule,
  GatewayModule,
  ChatModule,
    // RouterModule.register([
    //   {
    //     path: 'company',
    //     module: CompanyModule,
    //     children: [
    //       {
    //         path: ':companyId/job',
    //         module: JobModule,
    //       },
    //     ],
    //   },
    //   // {
    //   //   path: 'job',
    //   //   module: JobModule
    //   // }

    // ])
  ],


  controllers: [AppController],
  providers: [AppService, OtpRepository, OtpCleanupService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
