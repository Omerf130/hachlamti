import mongoose from 'mongoose'
import { connectDB } from './db'

/**
 * Centralized Mongoose type workarounds
 * 
 * These helpers exist to work around TypeScript issues with Mongoose v8 type overloads.
 * Instead of repeating type assertions throughout the codebase, we centralize them here.
 * 
 * See CURSOR_RULES.md and DECISIONS.md for context on these workarounds.
 */

/**
 * Find one document by ID
 * @param Model - Mongoose model
 * @param id - Document ID (string or ObjectId)
 * @returns Document or null
 */
export async function findById<T extends mongoose.Document>(
  Model: mongoose.Model<T>,
  id: string | mongoose.Types.ObjectId
): Promise<T | null> {
  try {
    await connectDB()
    
    const idObj = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    
    type FindByIdMethod = (id: mongoose.Types.ObjectId) => {
      lean: () => {
        exec: () => Promise<T | null>
      }
    }
    
    return await (Model.findById as unknown as FindByIdMethod)(idObj).lean().exec()
  } catch (error) {
    console.error(`Error in findById for model ${Model.modelName}:`, error)
    return null
  }
}

/**
 * Find one document by filter
 * @param Model - Mongoose model
 * @param filter - Query filter
 * @returns Document or null
 */
export async function findOne<T extends mongoose.Document>(
  Model: mongoose.Model<T>,
  filter: mongoose.FilterQuery<T>
): Promise<T | null> {
  try {
    await connectDB()
    
    type FindOneMethod = (filter: mongoose.FilterQuery<T>) => Promise<T | null>
    
    return await (Model.findOne as unknown as FindOneMethod)(filter)
  } catch (error) {
    console.error(`Error in findOne for model ${Model.modelName}:`, error)
    return null
  }
}

/**
 * Find many documents with optional sorting
 * @param Model - Mongoose model
 * @param filter - Query filter
 * @param sort - Sort order (optional)
 * @returns Array of documents
 */
export async function findMany<T extends mongoose.Document>(
  Model: mongoose.Model<T>,
  filter: mongoose.FilterQuery<T>,
  sort?: Record<string, 1 | -1>
): Promise<T[]> {
  try {
    await connectDB()
    
    type FindManyMethod = (filter: mongoose.FilterQuery<T>) => {
      sort: (sort: Record<string, 1 | -1>) => {
        lean: () => {
          exec: () => Promise<T[]>
        }
      }
    }
    
    const query = (Model.find as unknown as FindManyMethod)(filter)
    
    if (sort) {
      return await query.sort(sort).lean().exec()
    }
    
    // Without sort, we need a different type
    type FindManyNoSortMethod = (filter: mongoose.FilterQuery<T>) => {
      lean: () => {
        exec: () => Promise<T[]>
      }
    }
    
    return await (Model.find as unknown as FindManyNoSortMethod)(filter).lean().exec()
  } catch (error) {
    console.error(`Error in findMany for model ${Model.modelName}:`, error)
    return []
  }
}

/**
 * Delete one document by ID
 * @param Model - Mongoose model
 * @param id - Document ID (string or ObjectId)
 * @returns Success boolean
 */
export async function deleteById<T extends mongoose.Document>(
  Model: mongoose.Model<T>,
  id: string | mongoose.Types.ObjectId
): Promise<boolean> {
  try {
    await connectDB()
    
    const idObj = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
    
    type DeleteOneMethod = (filter: { _id: mongoose.Types.ObjectId }) => Promise<any>
    
    await (Model.deleteOne as unknown as DeleteOneMethod)({ _id: idObj })
    return true
  } catch (error) {
    console.error(`Error in deleteById for model ${Model.modelName}:`, error)
    return false
  }
}

/**
 * Find one document by ID and specific status
 * Common pattern for public detail pages (stories, therapists)
 * @param Model - Mongoose model
 * @param id - Document ID
 * @param status - Required status value
 * @returns Document or null
 */
export async function findByIdAndStatus<T extends mongoose.Document & { status: string }>(
  Model: mongoose.Model<T>,
  id: string,
  status: string
): Promise<T | null> {
  try {
    await connectDB()
    
    const idObj = new mongoose.Types.ObjectId(id)
    
    type FindOneMethod = (filter: { _id: mongoose.Types.ObjectId; status: string }) => {
      lean: () => {
        exec: () => Promise<T | null>
      }
    }
    
    return await (Model.findOne as unknown as FindOneMethod)({
      _id: idObj,
      status,
    }).lean().exec()
  } catch (error) {
    console.error(`Error in findByIdAndStatus for model ${Model.modelName}:`, error)
    return null
  }
}

