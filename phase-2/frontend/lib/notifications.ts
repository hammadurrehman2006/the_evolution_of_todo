/**
 * Mobile-Safe Notification Utility
 * Uses Service Worker API for mobile browser compatibility
 *
 * According to MDN:
 * - Notification() constructor throws TypeError on mobile browsers
 * - Must use ServiceWorkerRegistration.showNotification() on mobile
 * - Requires HTTPS (or localhost for development)
 */

let registration: ServiceWorkerRegistration | null = null

/**
 * Initialize notification system with service worker
 * Call this once on app startup
 */
export async function initNotifications(): Promise<boolean> {
  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('[Notifications] Service Worker not supported')
      return false
    }

    // Check if Notification API is available
    if (!('Notification' in window)) {
      console.log('[Notifications] Notification API not supported')
      return false
    }

    // Register service worker
    registration = await navigator.serviceWorker.register('/sw.js')
    console.log('[Notifications] Service Worker registered')

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready
    console.log('[Notifications] Service Worker ready')

    return true
  } catch (error) {
    console.error('[Notifications] Failed to initialize:', error)
    return false
  }
}

/**
 * Check if notifications are supported on this device
 */
export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  )
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) {
    return null
  }
  return Notification.permission
}

/**
 * Request notification permission from user
 * MUST be called in response to user interaction (click, tap, etc.)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('[Notifications] Permission:', permission)
    return permission
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error)
    return 'denied'
  }
}

/**
 * Show a notification using Service Worker (mobile-safe)
 * Works on both desktop and mobile browsers
 */
export async function showNotification(
  title: string,
  options?: {
    body?: string
    icon?: string
    tag?: string
    requireInteraction?: boolean
    data?: any
  }
): Promise<boolean> {
  try {
    // Check permission
    if (getNotificationPermission() !== 'granted') {
      console.warn('[Notifications] Permission not granted')
      return false
    }

    // Ensure service worker is registered and ready
    if (!registration) {
      const reg = await navigator.serviceWorker.ready
      registration = reg
    }

    // Use Service Worker API (mobile-safe)
    await registration.showNotification(title, {
      body: options?.body,
      icon: options?.icon || '/favicon.ico',
      tag: options?.tag,
      requireInteraction: options?.requireInteraction ?? false,
      data: options?.data,
      badge: '/favicon.ico',
      vibrate: [200, 100, 200], // Mobile vibration pattern
    })

    console.log('[Notifications] Notification shown:', title)
    return true
  } catch (error) {
    console.error('[Notifications] Failed to show notification:', error)
    return false
  }
}

/**
 * Show a task due soon notification
 */
export async function showTaskDueNotification(
  taskTitle: string,
  minutesLeft: number
): Promise<boolean> {
  const timeText = minutesLeft > 1
    ? `in ${minutesLeft} minutes`
    : 'in less than 1 minute'

  return showNotification('TaskHive - Task Due Soon', {
    body: `"${taskTitle}" is due ${timeText}!`,
    tag: `task-due-${minutesLeft}min`,
    requireInteraction: false,
    data: {
      type: 'task-due',
      taskTitle,
      minutesLeft,
    },
  })
}

/**
 * Check if notification system is ready to use
 */
export function isNotificationReady(): boolean {
  return (
    isNotificationSupported() &&
    getNotificationPermission() === 'granted' &&
    registration !== null
  )
}

/**
 * Get diagnostic info for debugging
 */
export function getNotificationDiagnostics(): {
  supported: boolean
  permission: NotificationPermission | null
  serviceWorkerRegistered: boolean
  ready: boolean
} {
  return {
    supported: isNotificationSupported(),
    permission: getNotificationPermission(),
    serviceWorkerRegistered: registration !== null,
    ready: isNotificationReady(),
  }
}
