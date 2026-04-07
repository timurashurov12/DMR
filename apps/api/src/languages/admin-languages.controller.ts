import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/language.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Admin / Languages')
@ApiBearerAuth('JWT-auth')
@Controller('admin/languages')
@UseGuards(JwtAuthGuard)
export class AdminLanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  findAll() {
    return this.languagesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateLanguageDto) {
    return this.languagesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLanguageDto) {
    return this.languagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languagesService.remove(id);
  }
}
