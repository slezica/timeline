import Ajv from 'ajv'
import addFormats from 'ajv-formats'


const ajv = new Ajv({
  allErrors: true,
  verbose: true
})

addFormats(ajv)


export const refSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,

  properties: {
    id: { type: 'string' },
  },
}


export const phoneSchema = {
  type: 'object',
  required: ['type', 'number'],
  additionalProperties: false,

  properties: {
    type  : { type: 'string' },
    number: { type: 'string' }
  }
}


export const baseDocSchema = {
  type: 'object',
  required: ['_id', 'type'],

  properties: {
    _id : { type: 'string' },
    _rev: { type: 'string' },
  },

  allOf: [
    { 'required': ['_id'] } // superflous, this is just to have a non-empty allOf field in the base :D
  ]
}


export const baseItemSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'kind', 'createdDate', 'updatedDate', 'title', 'body', 'refs'],
  additionalProperties: false,

  properties: {
    ...baseDocSchema.properties,
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
    },

    // References:
    refs: {
      type: 'array',
      items: refSchema,
    },

    deleted: {
      type: ['boolean']
    }
  },
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


export const contactSchema = {
  ...baseItemSchema,
  required: [...baseItemSchema.required ],

  properties: {
    ...baseItemSchema.properties,

    kind: { type: 'string', enum: ['contact'] },

    email: {
      type: ['string', 'null'],
    },

    phones: {
      type: 'array',
      items: phoneSchema,
    },

    organization: { type: ['string', 'null'] },
    birthday: { type: ['string', 'null'], format: 'date-time' },
    picture: { type: ['string', 'null'] }
  },

  allOf: [
    ...baseItemSchema.allOf,

    { anyOf: [
      { "required": ["email"] },
      { "required": ["phones"] }
    ]}
  ]
}


export const itemSchema = {
  oneOf: [taskSchema, noteSchema, contactSchema]
}


export const statusSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'migration'],

  properties: {
    ...baseDocSchema.properties,
    type: { type: 'string', enum: ['status'] },

    migration: {
      type: 'number',
      minimum: -1
    }
  }
}


export const shelfSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'refs'],

  properties: {
    ...baseDocSchema.properties,
    type: { type: 'string', enum: ['shelf'] },
    
    refs: {
      type: 'array',
      items: refSchema,
    }
  }
}


export const designSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', pattern: '^_design/' },
  }
}


export const docSchema = {
  oneOf: [statusSchema, itemSchema, shelfSchema, designSchema]
}


export const validateStatus = ajv.compile(statusSchema)
export const validateItem = ajv.compile(itemSchema)
export const validateDoc = ajv.compile(docSchema)
