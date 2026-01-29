import { DataSource } from 'typeorm';

// Usamos aserción de no nulo (!) para indicar que estas variables son obligatorias.
// Si faltan, la aplicación lanzará un error en tiempo de ejecución.
export default new DataSource({
  type: 'postgres',
  
  host: process.env.DATABASE_HOST!, 
  // Convertimos a string primero y luego a number, usando '!'
  port: parseInt(process.env.DATABASE_PORT! as string, 10),
  username: process.env.DATABASE_USERNAME!, 
  password: process.env.DATABASE_PASSWORD!, 
  database: process.env.DATABASE_NAME!,

  // Rutas y configuración de migraciones
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  
  // ✅ Crucial: Siempre 'false' para usar el flujo de migraciones
  synchronize: false, 
});