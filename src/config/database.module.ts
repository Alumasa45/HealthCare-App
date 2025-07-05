
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        const config: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5433),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>(
            'DB_PASSWORD',
            'aquinattaayo',
          ),
          database: configService.get<string>(
            'DB_DATABASE',
            'healthcare',
          ),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNC', true),
          logging: configService.get<boolean>('DB_LOGGING', false),
          migrations: [__dirname + '/../migrations/**/*{.ts,.js}'], 
        };
        logger.log('Successfully loaded database config');
        console.log('Database config success.')
        return config;
      },
    }),
  ],
})
export class DatabaseModule {}
