type EventCallback = () => void

let listeners: EventCallback[] = []

export const WATCHLIST_EVENTS = {
  ADDED: 'watchlist:added',
  REMOVED: 'watchlist:removed',
  REFRESH: 'watchlist:refresh',
} as const

export const emitWatchlistChanged = (action: keyof typeof WATCHLIST_EVENTS) => {
  console.log('Watchlist changed:', action)
  listeners.forEach(callback => {
    try {
      callback()
    } catch (error) {
      console.error('Error in watchlist callback:', error)
    }
  })
}

export const onWatchlistChanged = (callback: EventCallback) => {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter(listener => listener !== callback)
  }
}

export const clearAllListeners = () => {
  listeners = []
}
