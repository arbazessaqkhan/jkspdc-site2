import { IsString } from 'class-validator';

export class UpsertSiteSettingDto {
  @IsString({ message: 'Value must be a string' })
  value!: string;
}
