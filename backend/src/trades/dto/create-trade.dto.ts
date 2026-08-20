import {
    IsString,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateTradeDto {

    @IsString()
    symbol: string;

    @IsString()
    contractType: string;

    @IsNumber()
    @Min(1)
    stake: number;

    @IsNumber()
    tickDuration: number;

    @IsOptional()
    @IsNumber()
    barrier?: number;

}