import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix to match main.ts
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Local Business Listing Directory API')
    .setDescription('The API documentation for the Local Business Listing and Discovery Platform.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Ensure the directory exists
  const docsDir = path.join(__dirname, '../../../../docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outputPath = path.join(docsDir, 'swagger-collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log(`✅ Swagger collection generated at: ${outputPath}`);
  await app.close();
  process.exit(0);
}

generate().catch(err => {
  console.error('❌ Error generating Swagger collection:', err);
  process.exit(1);
});
