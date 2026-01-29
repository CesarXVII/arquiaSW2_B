import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AsistenteInteligenteModule } from './asistente_inteligente/asistente_inteligente.module';
import { TarjetaModule } from './tarjeta/tarjeta.module';
import { PagoModule } from './pago/pago.module';
import { PlantillaModule } from './plantilla/plantilla.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
      ],
      inject: [
        ConfigService,
      ],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres'>('DATABASE_TYPE')!,
        host: configService.get<string>('DATABASE_HOST')!,
        port: Number(configService.get<number>('DATABASE_PORT')!),
        username: configService.get<string>('DATABASE_USERNAME')!,
        password: configService.get<string>('DATABASE_PASSWORD')!,
        database: configService.get<string>('DATABASE_NAME')!,
        entities: [
          `${__dirname}/**/*.entity{.ts,.js}`,
        ],
        synchronize: true,
      }),
    }),
    UsuarioModule,
    ProyectoModule,
    WebsocketModule,
    AsistenteInteligenteModule,
    TarjetaModule,
    PagoModule,
    PlantillaModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}