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
    picture: {
      type: 'string',
    },
    company: {
      type: 'string',
      maxLength: 100,
    },
    about: {
      type: 'string',
      maxLength: 500,
    },
  },
  required: ['id', 'name', 'price', 'timestamp', 'picture', 'company'],
};
