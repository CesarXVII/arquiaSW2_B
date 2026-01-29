import {
  Controller,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { IaService } from './asistente_inteligente.service';

interface GenerarDiagramaBody {
  prompt: string;
}

interface GenerarDesdeImagenBody {
  base64Image: string;
  mimeType?: string;
}

interface EstimarPresupuestoBody {
  plano2dJson: any;
  base64Image: string;
  mimeType?: string;
}

@Controller('ia')
export class AsistenteInteligenteController {
  constructor(private readonly asistenteService: IaService) {}

  @Post('generar')
  async generarDiagrama(@Body() body: GenerarDiagramaBody) {
    const { prompt } = body;
    if (!prompt) {
      throw new BadRequestException("El campo 'prompt' es obligatorio");
    }
    return this.asistenteService.generarPlano2d(prompt);
  }

  @Post('imagen')
  async generarDesdeImagen(@Body() body: GenerarDesdeImagenBody) {
    const { base64Image, mimeType } = body;
    if (!base64Image) {
      throw new BadRequestException("El campo 'base64Image' es obligatorio");
    }
    return this.asistenteService.generarDesdeImagenBase64(
      base64Image,
      mimeType,
    );
  }

  @Post('presupuesto')
  async estimarPresupuesto(@Body() body: EstimarPresupuestoBody) {
    const { plano2dJson, base64Image, mimeType } = body;

    if (!plano2dJson) {
      throw new BadRequestException('El JSON del plano 2D es obligatorio');
    }
    if (!base64Image) {
      throw new BadRequestException("El campo 'base64Image' es obligatorio");
    }

    return this.asistenteService.estimarPresupuesto(
      plano2dJson,
      base64Image,
      mimeType,
    );
  }
}