import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportQueryDto } from './dto/report-query.dto';

/**
 * The GET /reports endpoint bypasses the global ResponseInterceptor (via
 * @Res()) because its shape — data: { records, summary } alongside a
 * top-level pagination meta — doesn't match what the interceptor's
 * isPaginated() auto-detection produces (it would flatten `data` down to
 * just the records array and drop `summary`). The export endpoints need
 * @Res() regardless, to stream a binary file instead of JSON.
 */
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const { records, summary, meta } = await this.reportsService.getRecords(
      user.userId,
      query,
    );
    res.status(200).json({
      type: 'success',
      status: 200,
      message: 'Request successful',
      data: { records, summary },
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  @Get('export/excel')
  async exportExcel(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportFilterDto,
    @Res() res: Response,
  ): Promise<void> {
    const { records, summary } = await this.reportsService.getRecordsForExport(
      user.userId,
      query,
    );
    const buffer = await this.reportsService.buildExcelBuffer(
      records,
      summary,
      query.report_type,
    );
    res
      .status(200)
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="report-${query.report_type}-${Date.now()}.xlsx"`,
      })
      .send(buffer);
  }

  @Get('export/pdf')
  async exportPdf(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ReportFilterDto,
    @Res() res: Response,
  ): Promise<void> {
    const { records, summary } = await this.reportsService.getRecordsForExport(
      user.userId,
      query,
    );
    const buffer = await this.reportsService.buildPdfBuffer(
      records,
      summary,
      query.report_type,
    );
    res
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${query.report_type}-${Date.now()}.pdf"`,
      })
      .send(buffer);
  }
}
