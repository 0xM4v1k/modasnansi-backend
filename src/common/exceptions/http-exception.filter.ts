import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import {
  //Request,
  Response,
} from 'express';

interface ExceptionResponse {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get the response object with proper typing
    const exceptionResponse = exception.getResponse() as ExceptionResponse;

    response.status(status).json({
      error: {
        status_code: status,
        message: exceptionResponse.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
