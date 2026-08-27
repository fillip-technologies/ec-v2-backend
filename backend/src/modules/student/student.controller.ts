import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateWorkspaceRepoDto } from './dto/update-workspace-repo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Permissions } from '../../core/decorators/permissions.decorator';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * GET /student/overview
   * Fetch active student progress metrics, recent AI evaluation review, and capstone project tracks
   */
  @Get('overview')
  @Roles('student', 'admin', 'super_admin')
  @Permissions('report:view')
  async getOverview(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getOverview(userId);
  }

  /**
   * GET /student/profile
   * Fetch student profile identity, institution name, and verification status
   */
  @Get('profile')
  @Roles('student', 'admin', 'super_admin')
  async getProfile(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getProfile(userId);
  }

  /**
   * GET /student/programs
   * Fetch all enrolled programs for student with live progress metrics and nested capstone projects
   */
  @Get('programs')
  @Roles('student', 'admin', 'super_admin')
  @Permissions('report:view')
  async getPrograms(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getPrograms(userId);
  }

  /**
   * GET /student/workspace
   * Fetch active program workspace snapshot with steps, tasks, and task resources
   */
  @Get('workspace')
  @Roles('student', 'admin', 'super_admin')
  @Permissions('project:enroll')
  async getWorkspace(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getWorkspace(userId);
  }

  /**
   * GET /student/submissions
   * List student task submissions with scores, status, and AI review evaluation
   */
  @Get('submissions')
  @Roles('student', 'admin', 'super_admin')
  async getSubmissions(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getSubmissions(userId);
  }

  /**
   * PATCH /student/workspace/:workspaceId/repo
   * Link or update GitHub repository URL for a project workspace
   */
  @Patch('workspace/:workspaceId/repo')
  @Roles('student', 'admin', 'super_admin')
  @Permissions('project:enroll')
  async updateWorkspaceRepo(
    @Request() req: any,
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() dto: UpdateWorkspaceRepoDto,
  ) {
    const userId = req.user.id;
    return this.studentService.updateWorkspaceRepo(userId, workspaceId, dto.repoUrl);
  }

  /**
   * POST /student/submissions
   * Submit deliverable payload for an open workspace step
   */
  @Post('submissions')
  @HttpCode(HttpStatus.CREATED)
  @Roles('student', 'admin', 'super_admin')
  @Permissions('project:enroll')
  async createSubmission(@Request() req: any, @Body() dto: CreateSubmissionDto) {
    const userId = req.user.id;
    return this.studentService.createSubmission(userId, dto);
  }

  /**
   * GET /student/rubrics
   * List AI rubrics, criteria max scores, and pass thresholds for student's workspace steps
   */
  @Get('rubrics')
  @Roles('student', 'admin', 'super_admin')
  async getRubrics(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getRubrics(userId);
  }

  /**
   * GET /student/certificates
   * List QR-verifiable completion certificates earned by student
   */
  @Get('certificates')
  @Roles('student', 'admin', 'super_admin')
  async getCertificates(@Request() req: any) {
    const userId = req.user.id;
    return this.studentService.getCertificates(userId);
  }
}
