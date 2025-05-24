// src/ORMconfig.ts
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { join } from 'path';
import { Logger } from '@nestjs/common';
// Importaciones de entidades...
import { Product } from './products/entities/product.entity';
import { Brand } from './brands/entities/brand.entity';
import { TargetAudience } from './target-audiences/entities/target-audience.entity';
import { Category } from './categories/entities/category.entity';
import { Size } from './sizes/entities/size.entity';
import { EducationLevel } from './education-levels/entities/education-level.entity';
import { User } from './users/entities/user.entity';
import { Permission } from './permissions/entities/permission.entity';
import { File } from './files/entities/file.entity';
import { ProductGroup } from './products/entities/product-group.entity';
import { LoggerOptions } from 'typeorm';

// Inicializa el logger para mensajes relacionados con la base de datos
const logger = new Logger('Database');

// Lista de todas las entidades que TypeORM debe gestionar
const entities = [
  Product,
  ProductGroup,
  Brand,
  TargetAudience,
  Category,
  Size,
  EducationLevel,
  User,
  Permission,
  File,
];

// Este tipo asegura que todas las configuraciones tengan la misma estructura
type DbEnvConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: LoggerOptions;
  maxQueryExecutionTime: number;
  poolSize?: number;
  extra?: Record<string, any>;
};

// Determina el entorno desde variables de entorno
const environment = process.env.ENVIRONMENT || 'development';
logger.log(`Iniciando base de datos en entorno: ${environment}`);

// Configuraciones específicas por entorno
const productionConfig: DbEnvConfig = {
  host: process.env.DB_HOST || '',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  synchronize: false,
  logging: ['error', 'warn'],
  maxQueryExecutionTime: 1000,
  poolSize: 50,
  extra: {
    connectionLimit: 50,
  },
};

const stagingConfig: DbEnvConfig = {
  host: process.env.STAGE_DB_HOST || '',
  port: Number(process.env.STAGE_DB_PORT) || 3306,
  username: process.env.STAGE_DB_USERNAME || '',
  password: process.env.STAGE_DB_PASSWORD || '',
  database: process.env.STAGE_DB_DATABASE || '',
  synchronize: false,
  logging: 'all',
  maxQueryExecutionTime: 1000,
};

const localConfig: DbEnvConfig = {
  host: process.env.LOCAL_DB_HOST || 'localhost',
  port: Number(process.env.LOCAL_DB_PORT) || 3306,
  username: process.env.LOCAL_DB_USERNAME || 'root',
  password: process.env.LOCAL_DB_PASSWORD || 'root',
  database: process.env.LOCAL_DB_DATABASE || 'modas-nansi-local',
  synchronize: true,
  logging: 'all',
  maxQueryExecutionTime: 2000,
};

// Mapa que asocia cada nombre de entorno con su configuración
const configs: Record<string, DbEnvConfig> = {
  production: productionConfig,
  staging: stagingConfig,
  local: localConfig,
  development: localConfig,
};

// Selecciona la configuración según el entorno (con tipado explícito)
const selectedConfig: DbEnvConfig = configs[environment] || localConfig;
logger.log(`Usando configuración para: ${environment.toUpperCase()}`);

// Verifica datos críticos antes de intentar conectar
if (
  !selectedConfig.host ||
  !selectedConfig.username ||
  !selectedConfig.database
) {
  logger.error(`Configuración incompleta para '${environment}'`);
  process.exit(1);
}

// Configuración final para TypeORM con tipado explícito para evitar errores
const config: MysqlConnectionOptions = {
  type: 'mysql',
  host: selectedConfig.host,
  port: selectedConfig.port,
  username: selectedConfig.username,
  password: selectedConfig.password,
  database: selectedConfig.database,
  entities,

  // Configuración de comportamiento
  synchronize: selectedConfig.synchronize,
  logging: selectedConfig.logging,
  maxQueryExecutionTime: selectedConfig.maxQueryExecutionTime,
  connectTimeout: 60000,

  // Opciones condicionales correctamente tipadas
  ...(selectedConfig.poolSize ? { poolSize: selectedConfig.poolSize } : {}),
  ...(selectedConfig.extra ? { extra: selectedConfig.extra } : {}),

  // Configuración de migraciones
  migrationsTableName: 'typeorm_migrations',
  migrations: [join(__dirname, 'migrations', '*.js')],
  migrationsRun: environment === 'production' || environment === 'staging',
};

export default config;
