export interface ErrorResponse {
  status_code: number;
  type: string; // Por ejemplo: "invalid_user", "product_not_found"
  message: string; // Mensaje descriptivo
  timestamp: string; // Cuándo ocurrió el error
  path?: string; // Ruta que generó el error
  // Campo de documentación - opcional pero listo para activarse
  docs_url?: string; // URL a la documentación sobre este error
}
