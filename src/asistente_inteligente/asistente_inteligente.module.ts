import {
  Module
} from '@nestjs/common';
import {
  IaService
} from './asistente_inteligente.service';
import {
  AsistenteInteligenteController
} from './asistente_inteligente.controller';

@Module({
  imports: [],
  controllers: [AsistenteInteligenteController],
  providers: [IaService],
})
export class AsistenteInteligenteModule {}