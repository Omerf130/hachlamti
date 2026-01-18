import mongoose from 'mongoose'
import { connectDB } from './db'

/**
 * Helper function to get a Mongoose model by name
 * Ensures model is registered before use
 */
function getModel<T extends mongoose.Document>(
  modelName: string
): mongoose.Model<T> | null {
  const Model = mongoose.models[modelName]
  if (!Model) {
    return null
  }
  return Model as mongoose.Model<T>
}

/**
 * Helper function to execute a find query with proper TypeScript handling
 * Returns empty array on error or if model not found
 */
export async function findMany<T extends mongoose.Document>(
  modelName: string,
  filter: mongoose.FilterQuery<T>,
  sort?: Record<string, 1 | -1>
): Promise<T[]> {
  try {
    await connectDB()

    const Model = getModel<T>(modelName)
    if (!Model) {
      return []
    }

    let query = Model.find(filter)
    if (sort) {
      query = query.sort(sort)
    }

    const execResult = query.exec() as unknown as Promise<T[]>
    const results = await execResult

    return results || []
  } catch (error) {
    console.error(`Error in findMany for model ${modelName}:`, error)
    return []
  }
}

/**
 * Helper function to execute a findOne query with proper TypeScript handling
 * Returns null on error or if model not found
 */
export async function findOne<T extends mongoose.Document>(
  modelName: string,
  filter: mongoose.FilterQuery<T>
): Promise<T | null> {
  try {
    await connectDB()

    const Model = getModel<T>(modelName)
    if (!Model) {
      console.error(`Model ${modelName} not found in mongoose.models`)
      return null
    }

    // TypeScript workaround: Mongoose findOne has complex overloads
    // Using unknown to narrow type per CURSOR_RULES.md (no any allowed)
    const findOneMethod = Model.findOne as unknown as (
      filter: mongoose.FilterQuery<T>
    ) => { exec: () => Promise<T | null> }

    const result = await findOneMethod(filter).exec()

    return result
  } catch (error) {
    // Log error for debugging
    console.error(`Error in findOne for model ${modelName}:`, error)
    return null
  }
}

/**
 * Helper function to find one document by ID and status
 * Common pattern for public detail pages
 */
export async function findOneByIdAndStatus<T extends mongoose.Document>(
  modelName: string,
  id: string,
  status: string
): Promise<T | null> {
  try {
    const idObj = new mongoose.Types.ObjectId(id)
    return findOne<T>(modelName, {
      _id: idObj,
      status,
    } as mongoose.FilterQuery<T>)
  } catch (error) {
    console.error(`Error in findOneByIdAndStatus for model ${modelName}:`, error)
    return null
  }
}

