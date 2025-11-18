import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FamilyMembersService } from './family-members.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@Controller('family-members')
export class FamilyMembersController {
  constructor(private readonly service: FamilyMembersService) { }

  @Post(':elderId')
  create(
    @Param('elderId', ParseIntPipe) elderId: number,
    @Body() dto: CreateFamilyMemberDto,
  ) {
    return this.service.create(elderId, dto);
  }

  @Get('elder/:elderId')
  findByElder(@Param('elderId', ParseIntPipe) elderId: number) {
    return this.service.findByElder(elderId);
  }

  @Put(':familyId')
  update(
    @Param('familyId', ParseIntPipe) familyId: number,
    @Body() dto: UpdateFamilyMemberDto,
  ) {
    return this.service.update(familyId, dto);
  }

  @Delete(':familyId/:elderId')
  remove(
    @Param('familyId', ParseIntPipe) familyId: number,
    @Param('elderId', ParseIntPipe) elderId: number,
  ) {
    return this.service.remove(familyId, elderId);
  }

  @Get('elder/:elderId/primary')
    findPrimaryByElder(@Param('elderId', ParseIntPipe) elderId: number) {
    return this.service.findPrimaryByElder(elderId);
  }
}
