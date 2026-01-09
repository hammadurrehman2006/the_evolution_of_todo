"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Moon, Sun, Laptop, User, Bell, Shield, Download, Trash2, ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Form States
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
    }
    
    // Check notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [session])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementation for profile update would go here
    // await authClient.updateUser({ name, email })
    alert("Profile update functionality coming soon!")
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications")
      return
    }
    
    const permission = await Notification.requestPermission()
    setNotificationsEnabled(permission === "granted")
  }

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    // Redirect handled by middleware usually, but fail-safe here
    if (typeof window !== 'undefined') router.push("/auth/login")
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
        </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Bell className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data">
            <Shield className="mr-2 h-4 w-4" />
            Data & Security
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={session.user.image || `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(session.user.email)}`} />
                  <AvatarFallback>
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-medium">{session.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  <Button variant="outline" size="sm" disabled>Change Avatar</Button>
                </div>
              </div>
              
              <Separator />
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your Name" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled // Often changing email requires re-verification
                    className="bg-muted"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Email addresses cannot be changed directly for security reasons.
                  </p>
                </div>
                <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4 max-w-md">
                    <Button 
                        variant={theme === 'light' ? 'default' : 'outline'} 
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setTheme('light')}
                    >
                        <Sun className="h-6 w-6" />
                        <span>Light</span>
                    </Button>
                    <Button 
                        variant={theme === 'dark' ? 'default' : 'outline'} 
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setTheme('dark')}
                    >
                        <Moon className="h-6 w-6" />
                        <span>Dark</span>
                    </Button>
                    <Button 
                        variant={theme === 'system' ? 'default' : 'outline'} 
                        className="flex flex-col h-auto py-4 gap-2"
                        onClick={() => setTheme('system')}
                    >
                        <Laptop className="h-6 w-6" />
                        <span>System</span>
                    </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive notifications about upcoming tasks.
                        </p>
                    </div>
                    <Switch 
                        checked={notificationsEnabled}
                        onCheckedChange={(checked) => {
                            if (checked) requestNotificationPermission()
                            // In a real app we would also save this preference to the backend
                            setNotificationsEnabled(checked)
                        }}
                    />
                </div>
                {!notificationsEnabled && (
                    <Alert>
                        <AlertTitle>Notifications are disabled</AlertTitle>
                        <AlertDescription>
                            Enable notifications to get reminders for your tasks.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DATA TAB */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Download your data or delete your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">
                            Download a JSON copy of all your tasks and settings.
                        </p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <div className="space-y-1">
                        <h4 className="font-medium text-destructive">Delete Account</h4>
                        <p className="text-sm text-destructive/80">
                            Permanently delete your account and all associated data.
                        </p>
                    </div>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
