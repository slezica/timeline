import Ajv from 'ajv'


const ajv = new Ajv()


const itemSchema = {
  type: 'object',
  required: ['_id', 'type', 'kind', 'title', 'body', 'createdDate', 'updatedDate'],
  additionalProperties: false,

  properties: {
    _id : { type: 'string', format: 'uuid' },
    _rev: { type: 'string' },
    type: { type: 'string', enum: ['item'] },
    kind: { type: 'string', enum: ['task', 'note' ] },

    // Base dates:
    createdDate: { type: 'string', format: 'date-time' },
    updatedDate: { type: 'string', format: 'date-time' },

    // Base content:
    title: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },

    body: {
      type: 'string',
      maxLength: 10000,
      default: ''
    },

    // References:
    refs: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id'],
        additionalProperties: false,

        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      default: []
    }
  },

  // Task extras:
  dueDate : { type: ['string', 'null'], format: 'date-time' },
  doneDate: { type: ['string', 'null'], format: 'date-time' },
}


const validateItem = ajv.compile(itemSchema)


export { itemSchema, validateItem }