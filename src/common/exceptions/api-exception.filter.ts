import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { ErrorResponse } from '../interfaces/error-response.interface';
import { ApiException } from './api-exception';
import { Request, Response } from 'express';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Crear la estructura base de la respuesta
    const errorResponse: ErrorResponse = {
      status_code: status,
      type: 'general_error', // Valor predeterminado
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Si es nuestra excepción personalizada, añadir la información adicional
    if (exception instanceof ApiException) {
      errorResponse.type = exception.getErrorType();

      // Campo de documentación - se añade solo si está presente
      const docsUrl = exception.getDocsUrl();
      if (docsUrl) {
        errorResponse.docs_url = docsUrl;
      }
    }

    response.status(status).json(errorResponse);
  }
}
