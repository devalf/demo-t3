export const productSchema = {
  title: 'product schema',
  version: 0,
  description: 'describes a product',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
    },
    price: {
      type: 'number',
      minimum: 0,
      maximum: 1000000,
    },
    tags: {
      type: 'array',
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: 'string',
      },
    },
    timestamp: {
      type: 'date-time',
    },
  },
  required: ['id', 'name', 'price', 'timestamp'],
};
