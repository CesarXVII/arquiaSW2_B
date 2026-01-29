import {
  IsIn,
  IsInt,
  IsOptional,
  Min,
  Max
} from 'class-validator';

export class CrearShareLinkDto {
  @IsIn(['read', 'write'])
  permission: 'read' | 'write';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays ? : number;
}