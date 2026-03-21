import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { databases } from '@/lib/appwrite'
import { ID, Query } from 'react-native-appwrite'
import { createActivity } from '@/lib/social'

// ============================================================================
// TYPES
// ============================================================================

export interface Collection {
  $id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  coverImage?: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface CollectionItem {
  $id: string
  collectionId: string
  movieId: string
  movieTitle: string
  moviePoster?: string
  movieBackdrop?: string
  addedAt: string
}

interface CollectionsContextType {
  collections: Collection[]
  currentCollection: Collection | null
  collectionItems: CollectionItem[]
  isLoading: boolean
  
  // Actions
  fetchCollections: () => Promise<void>
  createCollection: (name: string, description?: string, isPublic?: boolean) => Promise<Collection | null>
  updateCollection: (id: string, data: Partial<Collection>) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  fetchCollectionItems: (collectionId: string) => Promise<void>
  addToCollection: (collectionId: string, movie: MovieData) => Promise<void>
  removeFromCollection: (collectionId: string, movieId: string) => Promise<void>
  reorderCollection: (collectionId: string, fromIndex: number, toIndex: number) => Promise<void>
}

interface MovieData {
  id: string
  title: string
  poster?: string
  backdrop?: string
}

const CollectionsContext = createContext<CollectionsContextType>({} as CollectionsContextType)

// ============================================================================
// CONSTANTS
// ============================================================================

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || ''
const COLLECTIONS_COLLECTION_ID = 'user_collections'
const COLLECTION_ITEMS_COLLECTION_ID = 'collection_items'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapDocumentToCollection(doc: any): Collection {
  return {
    $id: doc.$id,
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    isPublic: doc.isPublic ?? false,
    coverImage: doc.coverImage,
    itemCount: doc.itemCount || 0,
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt || doc.$createdAt
  }
}

function mapDocumentToCollectionItem(doc: any): CollectionItem {
  return {
    $id: doc.$id,
    collectionId: doc.collectionId,
    movieId: doc.movieId,
    movieTitle: doc.movieTitle,
    moviePoster: doc.moviePoster,
    movieBackdrop: doc.movieBackdrop,
    addedAt: doc.$createdAt
  }
}

// ============================================================================
// PROVIDER
// ============================================================================

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  
  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null)
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchCollections = useCallback(async () => {
    if (!isLoggedIn || !user?.$id) return
    
    setIsLoading(true)
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS_COLLECTION_ID, [
        Query.equal('userId', user.$id),
        Query.orderDesc('$createdAt')
      ])
      setCollections(response.documents.map(mapDocumentToCollection))
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user?.$id])

  const createCollection = async (
    name: string, 
    description?: string, 
    isPublic: boolean = false
  ): Promise<Collection | null> => {
    if (!isLoggedIn || !user?.$id) return null
    
    try {
      const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, ID.unique(), {
        userId: user.$id,
        name,
        description,
        isPublic,
        itemCount: 0
      })
      
      const newCollection = mapDocumentToCollection(doc)
      setCollections(prev => [newCollection, ...prev])
      return newCollection
    } catch (error) {
      console.error('Error creating collection:', error)
      return null
    }
  }

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    try {
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, id, {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        coverImage: data.coverImage
      })
      
      const updated = mapDocumentToCollection(doc)
      setCollections(prev => prev.map(c => c.$id === id ? updated : c))
      
      if (currentCollection?.$id === id) {
        setCurrentCollection(updated)
      }
    } catch (error) {
      console.error('Error updating collection:', error)
    }
  }

  const deleteCollection = async (id: string) => {
    try {
      // First delete all items in the collection
      const items = await databases.listDocuments(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, [
        Query.equal('collectionId', id)
      ])
      
      for (const item of items.documents) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, item.$id)
      }
      
      // Then delete the collection
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, id)
      
      setCollections(prev => prev.filter(c => c.$id !== id))
      
      if (currentCollection?.$id === id) {
        setCurrentCollection(null)
        setCollectionItems([])
      }
    } catch (error) {
      console.error('Error deleting collection:', error)
    }
  }

  const fetchCollectionItems = async (collectionId: string) => {
    setIsLoading(true)
    try {
      const [collectionDoc, itemsResponse] = await Promise.all([
        databases.getDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, collectionId),
        databases.listDocuments(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, [
          Query.equal('collectionId', collectionId),
          Query.orderDesc('$createdAt')
        ])
      ])
      
      setCurrentCollection(mapDocumentToCollection(collectionDoc))
      setCollectionItems(itemsResponse.documents.map(mapDocumentToCollectionItem))
    } catch (error) {
      console.error('Error fetching collection items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCollection = async (collectionId: string, movie: MovieData) => {
    if (!isLoggedIn || !user?.$id) return
    
    try {
      // Check if already in collection
      const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, [
        Query.equal('collectionId', collectionId),
        Query.equal('movieId', movie.id),
        Query.limit(1)
      ])
      
      if (existing.documents.length > 0) {
        throw new Error('Movie already in collection')
      }
      
      // Add item
      await databases.createDocument(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, ID.unique(), {
        collectionId,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster,
        movieBackdrop: movie.backdrop
      })
      
      // Update collection item count
      const collection = collections.find(c => c.$id === collectionId)
      if (collection) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, collectionId, {
          itemCount: collection.itemCount + 1
        })
      }
      
      // Refresh items if viewing this collection
      if (currentCollection?.$id === collectionId) {
        await fetchCollectionItems(collectionId)
      }
      
      // Create activity
      if (collection) {
        await createActivity({
          userId: user.$id,
          userName: user.name,
          userAvatar: user.avatarUrl,
          type: 'added_to_watchlist',
          targetId: movie.id,
          targetTitle: movie.title,
          targetPoster: movie.poster
        })
      }
    } catch (error) {
      console.error('Error adding to collection:', error)
      throw error
    }
  }

  const removeFromCollection = async (collectionId: string, movieId: string) => {
    try {
      const items = await databases.listDocuments(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, [
        Query.equal('collectionId', collectionId),
        Query.equal('movieId', movieId),
        Query.limit(1)
      ])
      
      if (items.documents.length > 0) {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ITEMS_COLLECTION_ID, items.documents[0].$id)
        
        // Update collection item count
        const collection = collections.find(c => c.$id === collectionId)
        if (collection) {
          await databases.updateDocument(DATABASE_ID, COLLECTIONS_COLLECTION_ID, collectionId, {
            itemCount: Math.max(0, collection.itemCount - 1)
          })
        }
        
        // Refresh items if viewing this collection
        if (currentCollection?.$id === collectionId) {
          await fetchCollectionItems(collectionId)
        }
      }
    } catch (error) {
      console.error('Error removing from collection:', error)
    }
  }

  const reorderCollection = async (collectionId: string, fromIndex: number, toIndex: number) => {
    // This would require implementing ordered items
    // For now, just log
    console.log('Reorder:', { collectionId, fromIndex, toIndex })
  }

  const value: CollectionsContextType = {
    collections,
    currentCollection,
    collectionItems,
    isLoading,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    fetchCollectionItems,
    addToCollection,
    removeFromCollection,
    reorderCollection
  }

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  )
}

export function useCollections() {
  const context = useContext(CollectionsContext)
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useCollections must be used within a CollectionsProvider')
  }
  return context
}
