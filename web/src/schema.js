import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import addKeywords from "ajv-keywords"

const ajv = new Ajv({
  allErrors: true,
  verbose: true
})

addFormats(ajv)
addKeywords(ajv, ["uniqueItemProperties"])


/** @typedef {{
  id  : string,
  name: string
}} Ref */
export const refSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,

  properties: {
    id: { type: 'string' },
  },
}


/** @typedef {{
  type: string,
  number: string
}} Phone */
export const phoneSchema = {
  type: 'object',
  required: ['type', 'number'],
  additionalProperties: false,

  properties: {
    type  : { type: 'string' },
    number: { type: 'string' }
  }
}


/** @typedef {{
  _id: string,
  _rev?: string
}} BaseDoc */
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


/** @typedef {BaseDoc & {
  type: 'item',
  kind: string,
  createdDate: string,
  updatedDate: string,
  title: string,
  body: string,
  refs: Ref[],
  deleted?: boolean
}} BaseItem */
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
      uniqueItemProperties: ['id']
    },

    deleted: {
      type: ['boolean']
    }
  },
}


/** @typedef {BaseItem & {
  kind: 'task',
  dueDate: string | null,
  doneDate: string | null
}} Task */
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


/** @typedef {BaseItem & {
  kind: 'note'
}} Note */
export const noteSchema = {
  ...baseItemSchema,

  properties: {
    ...baseItemSchema.properties,

    kind: { type: 'string', enum: ['note'] },
  }
}


/** @typedef {BaseItem & {
  kind: 'contact',
  email?: string | null,
  phones?: Phone[],
  organization?: string | null,
  birthday?: string | null,
  picture?: string | null
}} Contact */
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


/** @typedef {Task | Note | Contact} Item */
export const itemSchema = {
  oneOf: [taskSchema, noteSchema, contactSchema]
}


/** @typedef {BaseDoc & {
  type: 'status',
  migration: number
}} Status */
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


/** @typedef {BaseDoc & {
  type: 'collection',
  refs: Ref[]
}} Collection */
export const collectionSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'refs'],

  properties: {
    ...baseDocSchema.properties,
    type: { type: 'string', enum: ['collection'] },
    refs: { type: 'array', items: refSchema }
  }
}


/** @typedef {{
  type: string
}} Design */
export const designSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', pattern: '^_design/' },
  }
}


/** @typedef {Item | Collection | Status | Design} Doc */
export const docSchema = {
  oneOf: [itemSchema, collectionSchema, statusSchema, designSchema]
}


export const validateStatus = ajv.compile(statusSchema)
export const validateItem = ajv.compile(itemSchema)
export const validateDoc = ajv.compile(docSchema)
