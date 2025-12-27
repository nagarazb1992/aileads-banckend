export const COMPANY_SCHEMA = {
  type: 'object',
  properties: {
    companies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          domain: { type: 'string' },
          country: { type: 'string' },
          industry: { type: 'string' }
        },
        required: ['name', 'domain', 'country', 'industry'],
        additionalProperties: false
      }
    }
  },
  required: ['companies'],
  additionalProperties: false
};
