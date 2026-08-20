import {
  IsEnum,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export enum Prediction {
  RISE = 'RISE',
  FALL = 'FALL',
}

export class PlaceTradeDto {
  @IsEnum(Prediction)
  prediction: Prediction;

  @IsNumber()
  @Min(1)
  stake: number;

  @IsInt()
  @Min(1)
  tickDuration: number;
}