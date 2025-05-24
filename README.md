# Modas Nansi Ecommerce Backend

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## TODO: Plan de seguridad de datos

### Configuración inmediata de TypeORM

- [ ] Deshabilitar `synchronize` en producción (`synchronize: process.env.NODE_ENV === 'development'`)
- [ ] Configurar `logging: ["query", "error"]` para mejor depuración
- [ ] Configurar `maxQueryExecutionTime: 1000` para detectar consultas lentas

### Sistema de migraciones

- [ ] Crear estructura de carpetas para migraciones
- [ ] Implementar script de generación de migraciones (`npm run migration:generate`)
- [ ] Crear script para ejecutar migraciones (`npm run migration:run`)
- [ ] Actualizar deployment pipeline para ejecutar migraciones automáticamente

### Respaldos de datos

- [ ] Implementar servicio de respaldos automáticos diarios
- [ ] Configurar almacenamiento de respaldos en S3/almacenamiento externo
- [ ] Crear política de retención de respaldos (7 días, 4 semanas, 12 meses)
- [ ] Implementar pruebas de restauración periódicas

### Sistema de notificaciones por email

- [ ] Instalar dependencias de email (`@nestjs-modules/mailer`, `handlebars`)
- [ ] Crear módulo y servicio de emails
- [ ] Implementar plantillas para diferentes tipos de alertas
- [ ] Configurar notificaciones de eventos críticos (errores, respaldos, etc.)

### Registro de auditoría

- [ ] Crear entidad para logs de auditoría (usuario, acción, fecha, IP)
- [ ] Implementar interceptor para registro automático de acciones
- [ ] Desarrollar panel de administración para revisar logs de auditoría
- [ ] Configurar retención y archivado de logs antiguos

### Entorno de staging

- [ ] Configurar entorno de staging para pruebas pre-producción
- [ ] Implementar despliegue automático de rama `staging` a entorno de pruebas
- [ ] Crear proceso de validación pre-deploy a producción

### Mejoras en validación de datos

- [ ] Revisar y reforzar DTOs con validaciones adicionales (rangos, formatos)
- [ ] Implementar validación de integridad referencial a nivel de aplicación
- [ ] Crear middleware para sanitización de datos de entrada

### Monitoreo y alertas

- [ ] Configurar PM2 para monitoreo básico de la aplicación
- [ ] Implementar healthchecks y endpoints de diagnóstico
- [ ] Configurar sistema de alertas para errores críticos
- [ ] Implementar dashboard de estado de la aplicación

### Documentación

- [ ] Crear guías de procedimientos de recuperación ante desastres
- [ ] Documentar estructura de base de datos y relaciones
- [ ] Crear manual de operaciones para el equipo de mantenimiento
- [ ] Establecer políticas de acceso y privilegios mínimos

### Configuración de replicación master-slave

- [ ] Configurar servidor MySQL master con log binario y opciones de replicación
- [ ] Configurar dos servidores MySQL slaves con read_only y opciones de replicación
- [ ] Modificar ORMconfig.ts para soportar replicación
- [ ] Implementar servicio de monitoreo de replicación
- [ ] Configurar alertas para problemas de replicación

### Checklist de Implementación de Transacciones

#### ProductsService

- [x] Método `create`: Ya implementado con QueryRunner
- [x] Método `update`: Ya implementado con QueryRunner
- [x] Método `remove`: Ya implementado con QueryRunner
- [ ] Método `findAllAdvance`: No es crítico (solo consulta)

#### ProductGroupsService

- [x] Método `create`: Ya implementado con QueryRunner
- [ ] **Método `update`**: PENDIENTE - Necesita implementación con QueryRunner
- [ ] **Método `remove`**: PENDIENTE - Necesita implementación con QueryRunner
- [ ] Método `findByQuery`: No es crítico (solo consulta)
- [ ] Método `findOne`: No es crítico (solo consulta)

#### FilesService

- [ ] **Método `upload`**: CRÍTICO - Necesita transacciones para S3 y DB
- [ ] **Método `remove`**: CRÍTICO - Necesita transacciones para S3 y DB
- [ ] **Método `update`** (si existe): Necesitaría transacciones

#### UsersService

- [ ] **Método `create`**: CRÍTICO - Para integridad de datos de usuarios
- [ ] **Método `update`**: CRÍTICO - Para permisos y roles
- [ ] **Método `remove`**: CRÍTICO - Si tiene asociaciones

#### Otros Servicios Potenciales

- [ ] **AuthService**: Métodos de registro/cambio de contraseña
- [ ] **Operaciones por lotes** en cualquier servicio
- [ ] **Endpoints que modifiquen múltiples tablas**

#### Próximos pasos prioritarios

1. Implementar transacciones en `update` y `remove` de ProductGroupsService
2. Implementar transacciones en FilesService (S3 + DB)
3. Revisar UsersService para manejo de transacciones en operaciones críticas
