import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class BuyContractDto {
  @IsString()
  symbol: string;

  @IsString()
  contractType: string;

  @IsOptional()
  @IsInt()
  barrier?: number;

  @IsInt()
  tickDuration: number;

  @IsNumber()
  stake: number;
}