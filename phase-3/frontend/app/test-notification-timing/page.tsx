"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCircle2, Clock } from 'lucide-react'
import {
  initNotifications,
  requestNotificationPermission,
  showTaskDueNotification,
  isNotificationReady,
  getNotificationPermission
} from '@/lib/notifications'

export default function TestNotificationTimingPage() {
  const [logs, setLogs] = useState<Array<{ time: string, message: string }>>([])
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [testRunning, setTestRunning] = useState(false)

  useEffect(() => {
    const setup = async () => {
      await initNotifications()
      setPermission(getNotificationPermission())
    }
    setup()
  }, [])

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { time, message }])
  }

  const test5MinNotification = async () => {
    if (!isNotificationReady()) {
      addLog('❌ Notification system not ready')
      return
    }

    addLog('📤 Sending 5-minute notification...')
    const success = await showTaskDueNotification('Test Task (5 min)', 5)

    if (success) {
      addLog('✅ 5-minute notification sent!')
    } else {
      addLog('❌ Failed to send 5-minute notification')
    }
  }

  const test1MinNotification = async () => {
    if (!isNotificationReady()) {
      addLog('❌ Notification system not ready')
      return
    }

    addLog('📤 Sending 1-minute notification...')
    const success = await showTaskDueNotification('Test Task (1 min)', 1)

    if (success) {
      addLog('✅ 1-minute notification sent!')
    } else {
      addLog('❌ Failed to send 1-minute notification')
    }
  }

  const testSequence = async () => {
    if (!isNotificationReady()) {
      addLog('❌ Notification system not ready - grant permission first')
      return
    }

    setTestRunning(true)
    addLog('🎬 Starting notification sequence test...')

    // Test 5-minute notification
    addLog('⏰ Step 1: Testing 5-minute notification')
    await test5MinNotification()

    // Wait 5 seconds
    addLog('⏸️ Waiting 5 seconds...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Test 1-minute notification
    addLog('⏰ Step 2: Testing 1-minute notification')
    await test1MinNotification()

    addLog('✅ Sequence test complete! You should have received BOTH notifications.')
    setTestRunning(false)
  }

  const setupPermission = async () => {
    addLog('🔔 Requesting notification permission...')
    await initNotifications()
    const result = await requestNotificationPermission()
    setPermission(result)

    if (result === 'granted') {
      addLog('✅ Permission granted!')
    } else {
      addLog('❌ Permission denied')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Notification Timing Test</CardTitle>
                <CardDescription>Test both 5-minute and 1-minute notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Permission: {permission || 'Unknown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {permission !== 'granted' && (
              <Button onClick={setupPermission} className="w-full">
                Grant Permission
              </Button>
            )}
            {permission === 'granted' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Ready to send notifications
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={test5MinNotification}
              className="w-full"
              disabled={permission !== 'granted'}
              variant="outline"
            >
              Send 5-Minute Notification
            </Button>

            <Button
              onClick={test1MinNotification}
              className="w-full"
              disabled={permission !== 'granted'}
              variant="outline"
            >
              Send 1-Minute Notification
            </Button>

            <Button
              onClick={testSequence}
              className="w-full"
              disabled={permission !== 'granted' || testRunning}
            >
              {testRunning ? 'Test Running...' : 'Run Full Sequence (Both Notifications)'}
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No events yet
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg text-sm font-mono bg-muted"
                  >
                    <span className="text-muted-foreground">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Grant Permission:</strong> Click the button above to enable notifications</p>
            <p><strong>2. Run Full Sequence:</strong> This will send BOTH notifications (5-min, then 1-min after 5 seconds)</p>
            <p><strong>3. Verify:</strong> You should see TWO separate notifications on your phone</p>
            <p className="pt-4 text-muted-foreground">
              💡 <strong>Expected:</strong> First notification says "due in 5 minutes", second says "due in less than 1 minute"
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
