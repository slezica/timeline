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


/** @typedef {{
  type: string,
  number: string
}} Phone */


/** @typedef {{
  _id: string,
  _rev?: string
}} BaseDoc */


/** @typedef {BaseDoc & {
  type: 'record',
  kind: string,
  createdDate: string,
  updatedDate: string,
  title: string,
  body: string,
  refs: Ref[],
  deleted?: boolean
}} BaseRecord */


/** @typedef {BaseRecord & {
  kind: 'task',
  dueDate: string | null,
  doneDate: string | null
}} Task */


/** @typedef {BaseRecord & {
  kind: 'note'
}} Note */


/** @typedef {BaseRecord & {
  kind: 'contact',
  email?: string | null,
  phones?: Phone[],
  organization?: string | null,
  birthday?: string | null,
  picture?: string | null
}} Contact */


/** @typedef {BaseDoc & {
  type: 'status',
  migration: number
}} Status */


/** @typedef {BaseDoc & {
  type: 'collection',
  refs: Ref[]
}} Collection */


/** @typedef {{
  type: string
}} Design */


/** @typedef {Task | Note | Contact} Record */

/** @typedef {Record | Collection | Status | Design} Doc */


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


export const baseRecordSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'kind', 'createdDate', 'updatedDate', 'title', 'body', 'refs'],
  additionalProperties: false,

  properties: {
    ...baseDocSchema.properties,
    type: { type: 'string', enum: ['record'] },

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


export const taskSchema = {
  ...baseRecordSchema,
  required: [...baseRecordSchema.required, 'dueDate', 'doneDate'],

  properties: {
    ...baseRecordSchema.properties,

    kind: { type: 'string', enum: ['task'] },
    dueDate: { type: ['string', 'null'], format: 'date-time' },
    doneDate: { type: ['string', 'null'], format: 'date-time' },
  }
}


export const noteSchema = {
  ...baseRecordSchema,

  properties: {
    ...baseRecordSchema.properties,

    kind: { type: 'string', enum: ['note'] },
  }
}


export const contactSchema = {
  ...baseRecordSchema,
  required: [...baseRecordSchema.required ],

  properties: {
    ...baseRecordSchema.properties,

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
    ...baseRecordSchema.allOf,

    { anyOf: [
      { "required": ["email"] },
      { "required": ["phones"] }
    ]}
  ]
}


export const recordSchema = {
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


export const collectionSchema = {
  ...baseDocSchema,
  required: [...baseDocSchema.required, 'refs'],

  properties: {
    ...baseDocSchema.properties,
    type: { type: 'string', enum: ['collection'] },
    refs: { type: 'array', items: refSchema }
  }
}


export const designSchema = {
  type: 'object',
  properties: {
    type: { type: 'string', pattern: '^_design/' },
  }
}


export const docSchema = {
  oneOf: [recordSchema, collectionSchema, statusSchema, designSchema]
}


export const validateStatus = ajv.compile(statusSchema)
export const validateRecord = ajv.compile(recordSchema)
export const validateDoc = ajv.compile(docSchema)
