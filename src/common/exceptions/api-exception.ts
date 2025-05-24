import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  private readonly errorType: string;
  private readonly docsUrl?: string;

  constructor(
    message: string,
    status: HttpStatus,
    errorType: string,
    docsUrl?: string,
  ) {
    super(message, status);
    this.errorType = errorType;
    this.docsUrl = docsUrl; // Opcional pero listo para usar
  }

  getErrorType(): string {
    return this.errorType;
  }

  getDocsUrl(): string | undefined {
    return this.docsUrl;
  }
}
