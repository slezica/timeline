import Ajv from 'ajv'
import addFormats from 'ajv-formats'


const ajv = new Ajv({
  allErrors: true,
  verbose: true
})

addFormats(ajv)


const refSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,

  properties: {
    id: { type: 'string' },
  },
}


const phoneSchema = {
  type: 'object',
  required: ['type', 'number'],
  additionalProperties: false,

  properties: {
    type  : { type: 'string' },
    number: { type: 'string' }
  }
}


const baseItemSchema = {
  type: 'object',
  required: ['_id', 'type', 'kind', 'createdDate', 'updatedDate', 'title', 'body', 'refs'],
  additionalProperties: false,

  properties: {
    // Identity:
    _id : { type: 'string' },
    _rev: { type: 'string' },
    type: { type: 'string', enum: ['item'] },

    // Dates:
    createdDate: { type: 'string', format: 'date-time' },
    updatedDate: { type: 'string', format: 'date-time' },

    // Text:
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
      items: refSchema,
      default: []
    }
  },

  allOf: [
    { 'required': ['_id'] } // superflous, this is just to have an allOf field in the base :D
  ]
}


export const taskSchema = {
  ...baseItemSchema,
  required: [...baseItemSchema.required, 'dueDate', 'doneDate'],

  properties: {
    ...baseItemSchema.properties,

    kind: { type: 'string', enum: ['task'] },
    dueDate: { type: ['string', 'null'], format: 'date-time' },
    doneDate: { type: ['string', 'null'], format: 'date-time' },
  }
}


export const noteSchema = {
  ...baseItemSchema,

  properties: {
    ...baseItemSchema.properties,

    kind: { type: 'string', enum: ['note'] },
  }
}


const contactSchema = {
  ...baseItemSchema,
  required: [...baseItemSchema.required ],

  properties: {
    ...baseItemSchema.properties,

    kind: { type: 'string', enum: ['contact'] },

    email: {
      type: ['string', 'null'],
      default: ''
    },

    phones: {
      type: 'array',
      items: phoneSchema,
      default: []
    },

    organization: { type: 'string', default: '' },
    birthday: { type: ['string', 'null'], format: 'date-time' },
    picture: { type: 'string', default: '' }
  },

  allOf: [
    ...baseItemSchema.allOf,

    { anyOf: [
      { "required": ["email"] },
      { "required": ["phones"] }
    ]}
  ]
}


// Universal validator that handles both items and contacts
const itemSchema = {
  oneOf: [taskSchema, noteSchema, contactSchema]
}


const validateItem = ajv.compile(itemSchema)


export { itemSchema, validateItem }