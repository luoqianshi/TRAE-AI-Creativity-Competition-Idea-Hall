import { Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './errorHandler';

/** 统一成功响应格式 */
export function successResponse<T>(res: Response, data: T, message = '操作成功'): void {
  res.json({ success: true, message, data });
}

/** 统一错误响应格式 */
export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown,
): void {
  res.status(statusCode).json({ success: false, message, code, details });
}

/** 400 Bad Request */
export function badRequest(res: Response, message = '请求参数错误', code = 'BAD_REQUEST'): void {
  errorResponse(res, 400, message, code);
}

/** 401 Unauthorized */
export function unauthorized(res: Response, message = '未授权访问', code = 'UNAUTHORIZED'): void {
  errorResponse(res, 401, message, code);
}

/** 403 Forbidden */
export function forbidden(res: Response, message = '禁止访问', code = 'FORBIDDEN'): void {
  errorResponse(res, 403, message, code);
}

/** 404 Not Found */
export function notFound(res: Response, message = '资源不存在', code = 'NOT_FOUND'): void {
  errorResponse(res, 404, message, code);
}

/** 500 Internal Server Error */
export function serverError(res: Response, message = '服务器内部错误', code = 'INTERNAL_ERROR'): void {
  errorResponse(res, 500, message, code);
}

/** 从 Error/ApiError/ZodError 转换为标准错误响应 */
export function handleError(res: Response, err: unknown): void {
  if (err instanceof ZodError) {
    badRequest(res, '参数验证失败', 'VALIDATION_ERROR');
    return;
  }

  if (err instanceof Error) {
    const apiErr = err as ApiError;
    const statusCode = apiErr.statusCode || 500;
    const code = apiErr.code || 'INTERNAL_ERROR';
    errorResponse(res, statusCode, apiErr.message || '未知错误', code);
    return;
  }

  serverError(res, '发生了未知错误', 'UNKNOWN_ERROR');
}

/** 校验必需参数是否存在 */
export function requireParams(params: Record<string, unknown>, required: string[]): string | null {
  for (const key of required) {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      return `缺少必需参数: ${key}`;
    }
  }
  return null;
}
