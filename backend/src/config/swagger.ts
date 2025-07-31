import swaggerJSDoc from 'swagger-jsdoc';

// Basic Swagger API documentation configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Chronicler API',
    version: '1.0.0',
    description: 'REST API for the Chronicler distance calculation application',
    contact: {
      name: 'Chronicler Team',
      email: 'support@chronicler.app'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server'
    },
    {
      url: 'https://api.chronicler.app',
      description: 'Production server'
    }
  ],
  components: {
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'healthy'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-30T12:00:00.000Z'
          },
          uptime: {
            type: 'number',
            example: 3600.5
          }
        }
      },
      DistanceCalculationRequest: {
        type: 'object',
        required: ['list1', 'list2'],
        properties: {
          list1: {
            type: 'array',
            items: {
              type: 'number'
            },
            example: [3, 4, 2, 1, 3, 3]
          },
          list2: {
            type: 'array',
            items: {
              type: 'number'
            },
            example: [4, 3, 5, 3, 9, 3]
          }
        }
      },
      DistancePair: {
        type: 'object',
        properties: {
          position: {
            type: 'number',
            example: 0
          },
          list1Value: {
            type: 'number',
            example: 1
          },
          list2Value: {
            type: 'number',
            example: 3
          },
          distance: {
            type: 'number',
            example: 2
          }
        }
      },
      DistanceCalculationMetadata: {
        type: 'object',
        properties: {
          originalList1Length: {
            type: 'number',
            example: 6
          },
          originalList2Length: {
            type: 'number',
            example: 6
          },
          processingTimeMs: {
            type: 'number',
            example: 2.5
          },
          memoryUsedMB: {
            type: 'number',
            example: 0.1
          },
          algorithmComplexity: {
            type: 'string',
            example: 'O(n log n) time, O(n) space'
          }
        }
      },
      DistanceCalculationResult: {
        type: 'object',
        properties: {
          totalDistance: {
            type: 'number',
            example: 11
          },
          pairs: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/DistancePair'
            }
          },
          metadata: {
            $ref: '#/components/schemas/DistanceCalculationMetadata'
          }
        }
      },
      FileUploadRequest: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Text file containing two columns of numbers'
          }
        }
      },
      FileUploadResult: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              list1: {
                type: 'array',
                items: {
                  type: 'number'
                }
              },
              list2: {
                type: 'array',
                items: {
                  type: 'number'
                }
              },
              metadata: {
                type: 'object',
                properties: {
                  filename: {
                    type: 'string',
                    example: 'data.txt'
                  },
                  size: {
                    type: 'number',
                    example: 1024
                  },
                  lines: {
                    type: 'number',
                    example: 6
                  }
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Input arrays must have equal length'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'File Upload',
      description: 'File upload and parsing endpoints'
    },
    {
      name: 'Distance Calculation',
      description: 'Manhattan distance calculation endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/index.ts'
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;