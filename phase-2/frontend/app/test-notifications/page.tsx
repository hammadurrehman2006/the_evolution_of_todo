"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

export default function TestNotificationsPage() {
  const [logs, setLogs] = useState<Array<{ type: 'success' | 'error' | 'info' | 'warning', message: string }>>([])
  const [notificationSupport, setNotificationSupport] = useState<boolean | null>(null)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Check notification support on mount
    checkSupport()
  }, [])

  const addLog = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setLogs(prev => [...prev, { type, message }])
  }

  const checkSupport = () => {
    addLog('info', '🔍 Checking browser support...')

    if (typeof window === 'undefined') {
      addLog('error', '❌ Window is undefined (SSR)')
      setNotificationSupport(false)
      return
    }

    if (!('Notification' in window)) {
      addLog('error', '❌ Notification API not in window')
      setNotificationSupport(false)
      return
    }

    if (typeof Notification !== 'function') {
      addLog('error', '❌ Notification is not a function')
      setNotificationSupport(false)
      return
    }

    if (Notification.requestPermission === undefined) {
      addLog('error', '❌ requestPermission method not available')
      setNotificationSupport(false)
      return
    }

    addLog('success', '✅ Notification API is supported!')
    setNotificationSupport(true)

    const currentPermission = Notification.permission
    setPermission(currentPermission)
    addLog('info', `📋 Current permission: ${currentPermission}`)
  }

  const requestPermission = async () => {
    addLog('info', '🔔 Requesting notification permission...')

    if (!notificationSupport) {
      addLog('error', '❌ Cannot request permission - API not supported')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        addLog('success', `✅ Permission granted: ${result}`)
      } else if (result === 'denied') {
        addLog('error', `❌ Permission denied: ${result}`)
      } else {
        addLog('warning', `⚠️ Permission default: ${result}`)
      }
    } catch (error) {
      addLog('error', `❌ Error requesting permission: ${error}`)
    }
  }

  const sendTestNotification = () => {
    addLog('info', '📤 Attempting to send test notification...')

    if (!notificationSupport) {
      addLog('error', '❌ Cannot send - API not supported')
      return
    }

    if (permission !== 'granted') {
      addLog('error', `❌ Cannot send - permission is: ${permission}`)
      return
    }

    try {
      const notification = new Notification('TaskHive Test', {
        body: 'If you see this, notifications are working! 🎉',
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
      })

      addLog('success', '✅ Test notification sent successfully!')

      notification.onclick = () => {
        addLog('info', '👆 Notification clicked!')
        notification.close()
      }

      notification.onerror = (error) => {
        addLog('error', `❌ Notification error: ${error}`)
      }

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
        addLog('info', '🔕 Notification closed automatically')
      }, 5000)

    } catch (error) {
      addLog('error', `❌ Error creating notification: ${error}`)
    }
  }

  const sendScheduledNotification = () => {
    addLog('info', '⏰ Scheduling notification in 10 seconds...')

    if (!notificationSupport) {
      addLog('error', '❌ Cannot schedule - API not supported')
      return
    }

    if (permission !== 'granted') {
      addLog('error', `❌ Cannot schedule - permission is: ${permission}`)
      return
    }

    setTimeout(() => {
      try {
        new Notification('TaskHive - Scheduled Test', {
          body: 'This notification was scheduled 10 seconds ago!',
          icon: '/favicon.ico',
          tag: 'scheduled-test',
          requireInteraction: false,
        })
        addLog('success', '✅ Scheduled notification sent!')
      } catch (error) {
        addLog('error', `❌ Scheduled notification failed: ${error}`)
      }
    }, 10000)

    addLog('success', '✅ Notification scheduled for 10 seconds from now')
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getStatusIcon = () => {
    if (notificationSupport === null) return <Info className="h-6 w-6" />
    if (notificationSupport === false) return <XCircle className="h-6 w-6 text-destructive" />
    if (permission === 'granted') return <CheckCircle2 className="h-6 w-6 text-green-500" />
    if (permission === 'denied') return <XCircle className="h-6 w-6 text-destructive" />
    return <AlertCircle className="h-6 w-6 text-yellow-500" />
  }

  const getStatusText = () => {
    if (notificationSupport === null) return 'Checking...'
    if (notificationSupport === false) return 'Not Supported'
    if (permission === 'granted') return 'Ready'
    if (permission === 'denied') return 'Denied'
    return 'Permission Needed'
  }

  const getStatusColor = () => {
    if (notificationSupport === null) return 'secondary'
    if (notificationSupport === false) return 'destructive'
    if (permission === 'granted') return 'default'
    if (permission === 'denied') return 'destructive'
    return 'secondary'
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Notification Test Tool</CardTitle>
                <CardDescription>Debug mobile notification issues without console access</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Notification API:</span>
              <Badge variant={notificationSupport ? 'default' : 'destructive'}>
                {notificationSupport === null ? 'Checking...' : notificationSupport ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Permission Status:</span>
              <Badge variant={getStatusColor()}>
                {permission || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Status:</span>
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>Run these tests in order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={checkSupport}
              className="w-full"
              variant="outline"
            >
              1. Check Browser Support
            </Button>

            <Button
              onClick={requestPermission}
              className="w-full"
              disabled={!notificationSupport}
            >
              2. Request Permission
            </Button>

            <Button
              onClick={sendTestNotification}
              className="w-full"
              disabled={permission !== 'granted'}
            >
              3. Send Test Notification
            </Button>

            <Button
              onClick={sendScheduledNotification}
              className="w-full"
              variant="secondary"
              disabled={permission !== 'granted'}
            >
              4. Schedule Notification (10s)
            </Button>

            <Button
              onClick={clearLogs}
              className="w-full"
              variant="ghost"
            >
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Live Logs ({logs.length})</CardTitle>
            <CardDescription>Real-time diagnostic information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No logs yet. Click "Check Browser Support" to start.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm font-mono ${
                      log.type === 'success' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                      log.type === 'error' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                      log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                      'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Check Browser Support:</strong> Verifies if your browser supports notifications</p>
            <p><strong>2. Request Permission:</strong> Opens the browser permission dialog</p>
            <p><strong>3. Send Test Notification:</strong> Sends an immediate test notification</p>
            <p><strong>4. Schedule Notification:</strong> Sends a notification after 10 seconds</p>
            <p className="pt-4 text-muted-foreground">
              💡 <strong>Tip:</strong> All status messages appear on this page, no console needed!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
