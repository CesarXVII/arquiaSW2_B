import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

const GOJS_PROMPT_INSTRUCTION_IMAGEN = `Eres experto en diseño de interiores, planos y GoJS. El usuario dará una imagen con un plano 2D (habitación/casa) con paredes, puertas, ventanas y mobiliario.

Tu tarea es:
1. Analizar la imagen.
2. Reconocer correctamente TODOS los elementos.
3. Distribuirlos de manera proporcional EXACTAMENTE como se ve en la imagen.
4. Devolver SOLO un JSON válido GoJS (sin explicaciones).

ESTRUCTURA JSON:
{"class":"GraphLinksModel","linkKeyProperty":"key","nodeDataArray":[...],"linkDataArray":[]}

REGLAS DE POSICIONAMIENTO (MUY IMPORTANTE):
- Cada objeto debe colocarse en una posición **loc** proporcional a la posición que ocupa en la imagen.
- Si un objeto está arriba a la derecha en la imagen, su loc debe reflejar una posición arriba a la derecha.
- Si dos objetos están alineados horizontalmente en la imagen, deben tener LOC con la misma coordenada Y o muy cercana.
- Si una habitación está a la izquierda de otra, su loc.x debe ser menor.
- Si un muro rodea un cuarto, sus loc deben coincidir con el borde del cuarto.
- Las puertas deben ubicarse sobre la pared donde aparecen.
- Las ventanas deben colocarse centradas o alineadas según su posición real en la imagen.
- Los muebles deben mantener: Distancia proporcional respecto a las paredes, Orientación correcta (angle), Posición exacta dentro del cuarto.
- El tamaño final debe respetar proporciones del plano original.

USAR ESTE JSON COMO EJEMPLO DE REFERENCIA DE BUEN POSICIONAMIENTO GOJS:
{
  "class": "GraphLinksModel",
  "linkKeyProperty": "key",
  "nodeDataArray": [
    {"key":1763661940575,"loc":"99.5 51","name":"Sala de Estar","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Sala","width":200,"height":200,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":3},
    {"key":1763661941894,"loc":"291.5 41","name":"Dormitorio Principal","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Dormitorio","width":180,"height":180,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":3},
    {"key":1763661948194,"loc":"59.5 213","name":"Baño Principal","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Baño","width":120,"height":120,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":3},
    {"key":1763661951142,"loc":"306.5 202.5","name":"Cocina","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Cocina","width":150,"height":139,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":3},
    {"key":1763661967876,"loc":"214.5 141.5","name":"Pasillo","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Pasillo","width":29,"height":16,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":2},
    {"key":1763661985870,"loc":"176 212.5","name":"Garaje","angle":0,"color":"rgba(202, 238, 255, 0.7)","label":"Garaje","width":107,"height":121,"category":"Room","textColor":"#464343ff","strokeColor":"#666262ff","strokeWidth":3},
    {"key":1763662022887,"loc":"177.25 111.25","name":"Puerta Negra (→)","angle":90,"color":"#111111","label":"Puerta Negra →","width":40,"height":4,"category":"Door","strokeColor":"#1a1a1a"},
    {"key":1763662051421,"loc":"2 30","name":"Ventana Pequeña","angle":90,"color":"#87CEEB","label":"Ventana Pequeña","width":40,"height":8,"category":"Window","strokeColor":"#4682B4","strokeWidth":2},
    {"key":-9,"loc":"59.5 129.75","name":"Puerta Negra (→)","angle":180,"color":"#111111","label":"Puerta Negra →","width":40,"height":4,"category":"Door","strokeColor":"#1a1a1a"},
    {"key":1763662117072,"loc":"-16 111.5","fill":"#000000","name":"Pared Negra Larga","angle":0,"label":"Negro","width":10,"height":322,"stroke":"#1A1A1A","category":"Wall","strokeWidth":2},
    {"key":-11,"loc":"397 111.5","fill":"#000000","name":"Pared Negra Larga","angle":180,"label":"Negro","width":10,"height":322,"stroke":"#1A1A1A","category":"Wall","strokeWidth":2},
    {"key":-12,"loc":"190.5 -64.5","fill":"#000000","name":"Pared Negra Larga","angle":90,"label":"Negro","width":10,"height":405,"stroke":"#1A1A1A","category":"Wall","strokeWidth":2},
    {"key":-13,"loc":"67.5 287.5","fill":"#000000","name":"Pared Negra Larga","angle":270,"label":"Negro","width":10,"height":159,"stroke":"#1A1A1A","category":"Wall","strokeWidth":2},
    {"key":-14,"loc":"291.5 287.5","fill":"#000000","name":"Pared Negra Larga","angle":270,"label":"Negro","width":10,"height":203,"stroke":"#1A1A1A","category":"Wall","strokeWidth":2},
    {"key":-15,"loc":"169.25 297","name":"Puerta Negra (→)","angle":0,"color":"#111111","label":"Puerta Negra →","width":40,"height":4,"category":"Door","strokeColor":"#1a1a1a"}
  ],
  "linkDataArray": []
}

REGLAS POR CATEGORÍA:
Room: {"key":num,"category":"Room","name":"str","label":"str","loc":"x y","angle":0,"width":num,"height":num,"color":"rgba(202,238,255,0.7)","strokeColor":"#666262ff","strokeWidth":3,"textColor":"#464343ff","fontSize":11}
Wall: {"key":num,"category":"Wall","name":"str","label":"str","loc":"x y","angle":num,"width":num,"height":num,"fill":"#000000","stroke":"#1A1A1A","strokeWidth":2,"fontSize":11}
Door: {"key":num,"category":"Door","name":"str","label":"str","loc":"x y","angle":num,"width":num,"height":num,"color":"#111111","strokeColor":"#1a1a1a","fontSize":11}
Window: {"key":num,"category":"Window","name":"str","label":"Ventana","loc":"x y","angle":num,"width":num,"height":num,"color":"#87CEEB","strokeColor":"#4682B4","strokeWidth":2,"fontSize":11}
Bed: {"key":num,"category":"Bed","name":"str","label":"Cama","loc":"x y","angle":num,"width":num,"height":num,"fontSize":11}
Sofa2Plazas: {"key":num,"category":"Sofa2Plazas","name":"str","label":"str","loc":"x y","angle":num,"fontSize":11}
SillaSimple: {"key":num,"category":"SillaSimple","name":"str","label":"Silla","loc":"x y","angle":num,"fontSize":11}
SillonIndividual: {"key":num,"category":"SillonIndividual","name":"str","label":"Sillón","loc":"x y","angle":num,"fontSize":11}
TV50: {"key":num,"category":"TV50","name":"str","label":"str","loc":"x y","angle":num,"fontSize":11}
Librero: {"key":num,"category":"Librero","name":"str","label":"Librero","loc":"x y","angle":num,"fontSize":11}
Stove: {"key":num,"category":"Stove","name":"str","label":"Estufa","loc":"x y","angle":num,"fontSize":11}
Oven: {"key":num,"category":"Oven","name":"str","label":"Horno","loc":"x y","angle":num,"fontSize":11}
Washer: {"key":num,"category":"Washer","name":"str","label":"Lavadora","loc":"x y","angle":num,"fontSize":11}
Trash: {"key":num,"category":"Trash","name":"str","label":"Basura","loc":"x y","angle":num,"fontSize":11}
Toilet: {"key":num,"category":"Toilet","name":"str","label":"WC","loc":"x y","angle":num,"fontSize":11}
Desk: {"key":num,"category":"Desk","name":"str","label":"Mesa","loc":"x y","angle":num,"color":"#8D6E63","width":num,"height":num,"fontSize":11}
Table: {"key":num,"category":"Table","name":"str","label":"str","loc":"x y","angle":num,"color":"#5D4037","width":num,"height":num,"fontSize":11}
TextLabel: {"key":num,"category":"TextLabel","name":"str","label":"str","text":"str","loc":"x y","angle":num,"textColor":"#000000","fontSize":11}

DIMENSIONES:
- Room width/height: 80–300
- Wall width: 8–12, height: 50–300
- Door width: 30–50, height: 4–8
- Window width: 40–80, height: 6–10
- Bed width: 32–90, height: 56–80
- Desk width: 100–180, height: 60–100
- Table width: 80–200, height: 60–120

Devuelve solo JSON sin explicaciones.`;

const GOJS_PROMPT_INSTRUCTION_GENERAR = `Devuelves SOLO JSON válido GoJS sin explicaciones.
Eres experto en GoJS y planos 2D.

ESTRUCTURA JSON:
{"class":"GraphLinksModel","linkKeyProperty":"key","nodeDataArray":[...],"linkDataArray":[]}

ANGLES:
angle=0 pared vertical izquierda
angle=90 pared horizontal superior
angle=180 pared vertical derecha
angle=270 pared horizontal inferior

HABITACIONES:
Si Room en loc="200 150" width=400 height=300
Bordes: izq x=0, der x=400, arr y=0, abj y=300

PAREDES FUERA DE HABITACION:
grosor=10

Pared IZQUIERDA:
loc="(centerX-width/2-5) centerY"
angle=0
width=10
height=roomHeight

Pared DERECHA:
loc="(centerX+width/2+5) centerY"
angle=180
width=10
height=roomHeight

Pared SUPERIOR:
loc="centerX (centerY-height/2-5)"
angle=90
width=10
height=roomWidth

Pared INFERIOR:
loc="centerX (centerY+height/2+5)"
angle=270
width=10
height=roomWidth

PUERTAS:
Mismo loc y angle que la pared donde se ubican
width=40-50
height=4-6

VENTANAS:
PEGADAS AL BORDE DE LA HABITACION (sin desplazamiento)
Si habitacion en loc="centerX centerY" width=roomWidth height=roomHeight

Ventana IZQUIERDA:
loc="(centerX-width/2) ventanaY"
angle=0
width=8
height=60-80

Ventana DERECHA:
loc="(centerX+width/2) ventanaY"
angle=180
width=8
height=60-80

Ventana SUPERIOR:
loc="ventanaX (centerY-height/2)"
angle=90
width=8
height=60-80

Ventana INFERIOR:
loc="ventanaX (centerY+height/2)"
angle=270
width=8
height=60-80

MUEBLES:
Dentro del área de la habitación
Margen de 30 desde las paredes

EJEMPLO:
Habitación loc="250 180" width=450 height=280
Bordes: izq=25, der=475, arr=40, abj=320

Pared IZQUIERDA: loc="20 180" angle=0 width=10 height=280
Pared DERECHA: loc="480 180" angle=180 width=10 height=280
Pared SUPERIOR: loc="250 35" angle=90 width=10 height=450
Pared INFERIOR: loc="250 325" angle=270 width=10 height=450

Puerta en pared derecha: loc="480 180" angle=180 width=45 height=5
Ventana en pared superior: loc="250 40" angle=90 width=8 height=70

Muebles area segura X=55-445 Y=70-290

CATEGORIAS:
Room: {"key":num,"category":"Room","name":"str","label":"str","loc":"x y","angle":0,"width":num,"height":num,"color":"rgba(202,238,255,0.7)","strokeColor":"#666262ff","strokeWidth":3,"textColor":"#464343ff","fontSize":11}
Wall: {"key":num,"category":"Wall","name":"str","label":"str","loc":"x y","angle":num,"width":10,"height":num,"fill":"#000000","stroke":"#1A1A1A","strokeWidth":2,"fontSize":11}
Door: {"key":num,"category":"Door","name":"str","label":"str","loc":"x y","angle":num,"width":num,"height":num,"color":"#111111","strokeColor":"#1a1a1a","fontSize":11}
Window: {"key":num,"category":"Window","name":"str","label":"Ventana","loc":"x y","angle":num,"width":num,"height":num,"color":"#87CEEB","strokeColor":"#4682B4","strokeWidth":2,"fontSize":11}
Bed: {"key":num,"category":"Bed","name":"str","label":"Cama","loc":"x y","angle":num,"width":num,"height":num,"fontSize":11}
Sofa2Plazas: {"key":num,"category":"Sofa2Plazas","name":"str","label":"str","loc":"x y","angle":num,"fontSize":11}
SillaSimple: {"key":num,"category":"SillaSimple","name":"str","label":"Silla","loc":"x y","angle":num,"fontSize":11}
SillonIndividual: {"key":num,"category":"SillonIndividual","name":"str","label":"Sillón","loc":"x y","angle":num,"fontSize":11}
TV50: {"key":num,"category":"TV50","name":"str","label":"str","loc":"x y","angle":num,"fontSize":11}
Librero: {"key":num,"category":"Librero","name":"str","label":"Librero","loc":"x y","angle":num,"fontSize":11}
Stove: {"key":num,"category":"Stove","name":"str","label":"Estufa","loc":"x y","angle":num,"fontSize":11}
Oven: {"key":num,"category":"Oven","name":"str","label":"Horno","loc":"x y","angle":num,"fontSize":11}
Washer: {"key":num,"category":"Washer","name":"str","label":"Lavadora","loc":"x y","angle":num,"fontSize":11}
Trash: {"key":num,"category":"Trash","name":"str","label":"Basura","loc":"x y","angle":num,"fontSize":11}
Toilet: {"key":num,"category":"Toilet","name":"str","label":"WC","loc":"x y","angle":num,"fontSize":11}
Sink: {"key":num,"category":"Sink","name":"str","label":"Lavabo","loc":"x y","angle":num,"fontSize":11}
Desk: {"key":num,"category":"Desk","name":"str","label":"Mesa","loc":"x y","angle":num,"color":"#8D6E63","width":num,"height":num,"fontSize":11}
Table: {"key":num,"category":"Table","name":"str","label":"str","loc":"x y","angle":num,"color":"#5D4037","width":num,"height":num,"fontSize":11}
TextLabel: {"key":num,"category":"TextLabel","name":"str","label":"str","text":"str","loc":"x y","angle":num,"textColor":"#000000","fontSize":11}

DIMENSIONES:
Room width/height: 150-500
Wall width: 10, height: 50-500
Door width: 40-50, height: 4-6
Window width: 8, height: 60-80
Bed width: 60-90, height: 70-100
Desk/Table width: 70-150, height: 60-100

PROCESO:
1. Identificar habitaciones
2. Calcular dimensiones proporcionales
3. Posicionar habitaciones
4. Calcular bordes de cada habitación
5. Crear 4 paredes FUERA de cada habitación
6. Colocar puertas SOBRE paredes mismo loc y angle
7. Colocar ventanas PEGADAS AL BORDE de habitación (sin desplazamiento adicional)
8. Distribuir muebles DENTRO con margen

IMPORTANTE:
Paredes verticales angle=0 izquierda o angle=180 derecha
Paredes horizontales angle=90 arriba o angle=270 abajo
Paredes FUERA de habitación desplazadas 5 desde borde
Puertas mismo loc y angle que su pared
Ventanas PEGADAS AL BORDE exacto de la habitación (centerX±width/2 o centerY±height/2)
Muebles dentro del área interior

Devuelve UNICAMENTE el JSON sin explicaciones ni markdown.`;

const GOJS_PROMPT_INSTRUCTION_ESTIMAR_PRESUPUESTO = `Eres un experto en planificación de proyectos, estimación de costos y análisis de planos 2D con GoJS, especializado en generar reportes de presupuesto para construcción.

Recibirás dos entradas:
1. Una imagen del plano en formato Base64.
2. Un JSON de GoJS que representa el plano en formato GraphLinksModel.

Tu tarea es analizar ambos y devolver ÚNICAMENTE un JSON con la siguiente información, con datos lo más realistas posible en Bolivia (moneda BOB), siguiendo la estructura EXACTA para facilitar la generación de un documento PDF similar al proporcionado en la imagen. El JSON DEBE incluir la estimación de tiempo, mano de obra y costos extras, además del detalle de materiales.

IMPORTANTE: En la clave "fecha" dentro de "informacionGeneral" DEBES usar siempre la fecha fija "21/11/2025".

Devuelve únicamente el JSON, sin explicaciones, comentarios ni texto adicional.

Ejemplo de estructura de salida para la generación del PDF:
{
  "reporteTitulo": "REPORTE DE PRESUPUESTO DE MATERIALES",
  "informacionGeneral": {
    "proyecto": "Casa Residencial Unifamiliar",
    "superficieTotal": 78.0,
    "unidadSuperficie": "m²",
    "generadoPor": "ARQIA",
    "fecha": "21/11/2025",
    "resumen": {
      "superficiePiso": 78.0,
      "alturaEstandar": 2.80,
      "superficieMurosNeta": 142.5,
      "ambientesDetectados": "Sala, Cocina, 2 Dormitorios, Baño, Lavandería",
      "aberturasDetectadas": "3 puertas, 3 ventanas"
    }
  },
  "areasPorAmbiente": [
    { "ambiente": "Sala", "areaM2": 22.0 },
    { "ambiente": "Cocina", "areaM2": 10.5 },
    { "ambiente": "Dormitorio 1", "areaM2": 14.0 },
    { "ambiente": "Dormitorio 2", "areaM2": 12.5 },
    { "ambiente": "Baño", "areaM2": 5.0 },
    { "ambiente": "Lavandería", "areaM2": 4.0 },
    { "ambiente": "Total", "areaM2": 78.0 }
  ],
  "costoEstimado": {
    "moneda": "BOB",
    "detalleMateriales": [
      { "material": "Ladrillos (6 huecos)", "cantidad": 7837, "unidad": "unidades", "precioUnitario": 0.95, "subtotal": 7445.15 },
      { "material": "Cemento (IP-30)", "cantidad": 60, "unidad": "bolsas", "precioUnitario": 50.00, "subtotal": 3000.00 },
      { "material": "Arena fina", "cantidad": 5.0, "unidad": "m³", "precioUnitario": 130.00, "subtotal": 650.00 },
      { "material": "Grava/Ripios", "cantidad": 3.0, "unidad": "m³", "precioUnitario": 110.00, "subtotal": 330.00 },
      { "material": "Cerámica piso (86 m²)", "cantidad": 86, "unidad": "m²", "precioUnitario": 95.00, "subtotal": 8170.00 },
      { "material": "Pegamento cerámico", "cantidad": 22, "unidad": "bolsas", "precioUnitario": 35.00, "subtotal": 770.00 }
    ],
    "detalleManoObraYExtras": [
      { "categoria": "Mano de Obra (Albañilería y Acabados)", "costo": 35000.00 },
      { "categoria": "Instalación Eléctrica y Sanitaria", "costo": 8000.00 },
      { "categoria": "Costos Extras (Herramientas, Alquiler, Transporte)", "costo": 4500.00 }
    ],
    "totalMateriales": 20365.15,
    "totalManoObraYExtras": 47500.00,
    "totalGeneral": 67865.15
  },
  "equipoNecesario": [
    { "rol": "Ingeniero/Maestro de Obra", "cantidad": 1, "salarioAproxDia": 350.00 },
    { "rol": "Albañil Principal", "cantidad": 1, "salarioAproxDia": 250.00 },
    { "rol": "Ayudante de Construcción", "cantidad": 2, "salarioAproxDia": 120.00 }
  ],
  "tiempoEstimadoCronograma": {
    "duracion": "60 a 75 días hábiles",
    "descripcion": "Estimación que incluye obra gruesa y fina. Sujeto a demoras por inspecciones o condiciones externas."
  },
  "observaciones": "Los cálculos se basan en una interpretación estándar del plano 2D. Los precios unitarios y la mano de obra son estimados en BOB y no contractuales. Se recomienda realizar una verificación in-situ."
}`;

type GoJsModelJson = any;

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';

  private readonly openaiModel = 'gpt-4.1-mini';

  private readonly openaiApiKey: string;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('openai.api.key');
    if (!key) {
      this.logger.error(
        'Falta la clave de la API de OpenAI en .env (openai.api.key).',
      );
      throw new Error(
        'Falta la clave API de OpenAI. Debe estar configurada como openai.api.key.',
      );
    }
    this.openaiApiKey = key;
  }

  private createHttpClient(): AxiosInstance {
    return axios.create({
      baseURL: this.openaiApiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
    });
  }

  private extractJsonFromResponse(text: string): GoJsModelJson {
    const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
    try {
      return JSON.parse(cleanedText);
    } catch (e) {
      this.logger.error(
        'No se pudo parsear la respuesta como JSON:',
        cleanedText,
      );
      throw new InternalServerErrorException(
        'La API devolvió una respuesta no parseable como JSON.',
      );
    }
  }

  async generarPlano2d(prompt: string): Promise<GoJsModelJson> {
    if (!prompt) {
      throw new BadRequestException("El campo 'prompt' es obligatorio.");
    }

    const httpClient = this.createHttpClient();

    const payload = {
      model: this.openaiModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: GOJS_PROMPT_INSTRUCTION_GENERAR },
        { role: 'user', content: prompt },
      ],
    };

    try {
      this.logger.log(
        `Llamando a OpenAI (${this.openaiModel}) para generar diagrama...`,
      );
      const response = await httpClient.post('', payload);
      const textoRespuesta = response.data.choices[0].message.content.trim();
      return this.extractJsonFromResponse(textoRespuesta);
    } catch (error: any) {
      this.logger.error(
        'Error al llamar a la API de OpenAI (generarPlano2d):',
        error.message,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        'Error al comunicarse con la API de OpenAI.',
      );
    }
  }

  async generarDesdeImagenBase64(
    base64Image: string,
    mimeType: string = 'image/png',
  ): Promise<GoJsModelJson> {
    if (!base64Image) {
      throw new BadRequestException('La imagen en base64 es obligatoria.');
    }

    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    const httpClient = this.createHttpClient();

    const payload = {
      model: this.openaiModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: GOJS_PROMPT_INSTRUCTION_IMAGEN },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analiza la siguiente imagen del plano 2D y genera el JSON GoJS según la estructura indicada.',
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    };

    try {
      this.logger.log(
        `Llamando a OpenAI (${this.openaiModel}) para generar desde imagen...`,
      );
      const response = await httpClient.post('', payload);
      const textoRespuesta = response.data.choices[0].message.content.trim();
      return this.extractJsonFromResponse(textoRespuesta);
    } catch (error: any) {
      this.logger.error(
        'Error al llamar a la API de OpenAI (generarDesdeImagenBase64):',
        error.message,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        'Error al comunicarse con la API de OpenAI.',
      );
    }
  }

  async estimarPresupuesto(
    plano2dJson: GoJsModelJson,
    base64Image: string,
    mimeType: string = 'image/png',
  ): Promise<GoJsModelJson> {
    if (!plano2dJson) {
      throw new BadRequestException('El JSON del plano 2D es obligatorio.');
    }
    if (!base64Image) {
      throw new BadRequestException('La imagen en base64 es obligatoria.');
    }

    const httpClient = this.createHttpClient();
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const payload = {
      model: this.openaiModel,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: GOJS_PROMPT_INSTRUCTION_ESTIMAR_PRESUPUESTO,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Analiza el siguiente plano 2D en formato GoJS (GraphLinksModel) ' +
                'junto con la imagen del plano en Base64 y devuelve únicamente el JSON de estimación de presupuesto solicitado.\n\n' +
                `Plano GoJS JSON:\n${JSON.stringify(plano2dJson)}`,
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    };

    try {
      this.logger.log(
        `Llamando a OpenAI (${this.openaiModel}) para estimar presupuesto...`,
      );
      const response = await httpClient.post('', payload);
      const textoRespuesta = response.data.choices[0].message.content.trim();
      return this.extractJsonFromResponse(textoRespuesta);
    } catch (error: any) {
      this.logger.error(
        'Error al llamar a la API de OpenAI (estimarPresupuesto):',
        error.message,
        error.response?.data,
      );
      throw new InternalServerErrorException(
        'Error al comunicarse con la API de OpenAI.',
      );
    }
  }
}