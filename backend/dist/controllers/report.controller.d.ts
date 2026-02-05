import { Request, Response } from 'express';
/**
 * @desc    Submit a report for a website
 * @route   POST /api/v1/reports
 * @access  Private (Authenticated users)
 */
export declare const createReport: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get current user's reports
 * @route   GET /api/v1/reports/my-reports
 * @access  Private (Authenticated users)
 */
export declare const getMyReports: (req: Request, res: Response, next: import("express").NextFunction) => void;
/**
 * @desc    Get a specific report by ID
 * @route   GET /api/v1/reports/:id
 * @access  Private (Owner or Admin)
 */
export declare const getReportById: (req: Request, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=report.controller.d.ts.map