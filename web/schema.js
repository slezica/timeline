import Ajv from 'ajv'
import addFormats from 'ajv-formats'


const ajv = new Ajv()
addFormats(ajv)


const itemSchema = {
  type: 'object',
  required: ['_id', 'type', 'kind', 'title', 'body', 'createdDate', 'updatedDate'],
  additionalProperties: false,

  properties: {
    _id : { type: 'string' },
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
    },

    // Task extras (conditional):
    dueDate : { type: ['string', 'null'], format: 'date-time' },
    doneDate: { type: ['string', 'null'], format: 'date-time' },
  },

  // Constraints:
  allOf: [
    { if: { properties: { kind: { const: 'task' } } },
      then: { required: ['dueDate', 'doneDate'] },
      else: { not: {
        anyOf: [
          { required: ['dueDate'] },
          { required: ['doneDate'] }
        ]
      }}
    }
  ]
}


const validateItem = ajv.compile(itemSchema)


export { itemSchema, validateItem }