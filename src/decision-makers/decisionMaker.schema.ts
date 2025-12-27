export const DECISION_MAKER_SCHEMA = {
  type: 'object',
  properties: {
    decision_makers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          title: { type: 'string' },
          email: { type: 'string' },
          linkedinUrl: { type: 'string' },
          confidence: { type: 'number' },
        },
        required: ['name', 'title', 'email', 'linkedinUrl', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['decision_makers'],
  additionalProperties: false,
};
