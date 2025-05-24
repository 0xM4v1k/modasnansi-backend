export enum ErrorType {
  // Tipos generales
  VALIDATION_ERROR = 'validation_error',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',

  // Tipos específicos de entidades
  USER_NOT_FOUND = 'user_not_found',
  PRODUCT_NOT_FOUND = 'product_not_found',
  ORDER_NOT_FOUND = 'order_not_found',

  // Problemas de autenticación
  INVALID_CREDENTIALS = 'invalid_credentials',
  TOKEN_EXPIRED = 'token_expired',

  // Problemas de datos
  DUPLICATE_ENTRY = 'duplicate_entry',
  INVALID_DATA = 'invalid_data',

  // Errores del sistema
  INTERNAL_ERROR = 'internal_server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
}
