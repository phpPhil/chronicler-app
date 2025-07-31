#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { swaggerSpec } from '../config/swagger';

/**
 * Generate Swagger/OpenAPI documentation files
 * 
 * Outputs:
 * - api-docs.json: Complete OpenAPI spec in JSON format
 * - api-docs.yaml: Complete OpenAPI spec in YAML format (future)
 * - docs/: Static HTML documentation (future)
 */

const generateSwaggerDocs = async () => {
  try {
    console.log('🔧 Generating Swagger API documentation...');
    
    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'docs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Created docs directory');
    }
    
    // Generate JSON specification
    const jsonPath = path.join(process.cwd(), 'api-docs.json');
    const jsonSpec = JSON.stringify(swaggerSpec, null, 2);
    fs.writeFileSync(jsonPath, jsonSpec);
    console.log(`✅ Generated JSON spec: ${jsonPath}`);
    
    // Copy spec to docs directory as well
    const docsJsonPath = path.join(outputDir, 'api-docs.json');
    fs.writeFileSync(docsJsonPath, jsonSpec);
    console.log(`✅ Generated docs JSON spec: ${docsJsonPath}`);
    
    // Generate basic HTML documentation
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chronicler API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui.css" />
    <style>
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 20px 0; }
        .swagger-ui .info .title { color: #4169E1; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.0.1/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: './api-docs.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.presets.standalone
            ],
            layout: "BaseLayout",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1
        });
    </script>
</body>
</html>
    `.trim();
    
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlTemplate);
    console.log(`✅ Generated HTML docs: ${htmlPath}`);
    
    // Generate README for the docs
    const readmePath = path.join(outputDir, 'README.md');
    const readmeContent = `
# Chronicler API Documentation

This directory contains the auto-generated API documentation for the Chronicler backend.

## Files

- \`api-docs.json\` - OpenAPI 3.0 specification in JSON format
- \`index.html\` - Interactive Swagger UI documentation
- \`README.md\` - This file

## Usage

### View Documentation Locally

1. **Option 1: Simple HTTP Server**
   \`\`\`bash
   cd docs
   python -m http.server 8080
   # or
   npx serve .
   \`\`\`
   Then open http://localhost:8080

2. **Option 2: Using the Backend Server**
   The documentation is also served at http://localhost:3001/api/docs when the backend is running.

3. **Option 3: Direct File**
   Open \`index.html\` directly in your browser (may have CORS limitations).

### Regenerate Documentation

Run the following command from the backend directory:

\`\`\`bash
npm run docs:generate
\`\`\`

## API Endpoints

The Chronicler API provides the following main endpoints:

- \`GET /api/health\` - Health check
- \`POST /api/upload\` - Upload and parse text files
- \`POST /api/distance/calculate\` - Calculate Manhattan distance

For detailed information about request/response formats, error codes, and examples, view the interactive documentation.

## Development

This documentation is automatically generated from JSDoc comments in the source code. To update:

1. Update JSDoc comments in route files (\`src/routes/*.ts\`)
2. Update swagger configuration in \`src/config/swagger.ts\`  
3. Run \`npm run docs:generate\` to regenerate

---

Generated on ${new Date().toISOString()}
    `.trim();
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ Generated docs README: ${readmePath}`);
    
    // Print summary
    console.log('\n📊 Documentation Summary:');
    console.log(`   📋 Endpoints documented: ${Object.keys((swaggerSpec as any).paths || {}).length}`);
    console.log(`   🏷️  Schemas defined: ${Object.keys((swaggerSpec as any).components?.schemas || {}).length}`);
    console.log(`   🏃 Servers configured: ${((swaggerSpec as any).servers?.length || 0)}`);
    
    console.log('\n🎉 Swagger documentation generated successfully!');
    console.log('\n📖 To view documentation:');
    console.log('   • Start backend: npm run dev');
    console.log('   • Visit: http://localhost:3001/api/docs');
    console.log('   • Or serve docs/: npx serve docs');
    
  } catch (error) {
    console.error('❌ Error generating Swagger docs:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateSwaggerDocs();
}

export { generateSwaggerDocs };