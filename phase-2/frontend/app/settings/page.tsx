"use client"

import { useState, useEffect } from "react"
import { useSession, authClient } from "@/lib/auth-client"
import { apiClient } from "@/lib/api-client"
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
import { Loader2, Moon, Sun, Laptop, User, Bell, Shield, Download, Trash2, ArrowLeft, RefreshCcw, Upload, X } from "lucide-react"

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Form States
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      setImage(session.user.image || "")
    }
    
    // Check notification permission and local storage preference
    if (typeof window !== "undefined") {
        const storedPref = localStorage.getItem("notificationsEnabled")
        if (storedPref) {
            setNotificationsEnabled(storedPref === "true")
        } else if ("Notification" in window) {
            setNotificationsEnabled(Notification.permission === "granted")
        }
    }
  }, [session])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
        await authClient.updateUser({ name, image })
        alert("Profile updated successfully!")
    } catch (error) {
        console.error("Failed to update profile", error)
        alert("Failed to update profile.")
    } finally {
        setIsUpdating(false)
    }
  }

  const handleRandomizeAvatar = async () => {
    setIsUpdating(true)
    const randomSeed = Math.random().toString(36).substring(7)
    const newAvatarUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${randomSeed}`
    setImage(newAvatarUrl)
    
    try {
        await authClient.updateUser({ image: newAvatarUrl })
    } catch (error) {
        console.error("Failed to update avatar", error)
        // Revert on failure
        if (session?.user?.image) setImage(session.user.image)
    } finally {
        setIsUpdating(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit file size to 1MB
    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      setImage(base64String)
      setIsUpdating(true)
      try {
        await authClient.updateUser({ image: base64String })
      } catch (error) {
        console.error("Failed to upload avatar", error)
        alert("Failed to upload avatar.")
        // Revert
        if (session?.user?.image) setImage(session.user.image)
      } finally {
        setIsUpdating(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove custom avatar?")) return
    
    setIsUpdating(true)
    const defaultAvatar = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(session?.user?.email || 'default')}`
    setImage(defaultAvatar)

    try {
      await authClient.updateUser({ image: defaultAvatar }) 
    } catch (error) {
      console.error("Failed to remove avatar", error)
      if (session?.user?.image) setImage(session.user.image)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
        const todos = await apiClient.getTodos()
        const data = {
            user: {
                name: session?.user?.name,
                email: session?.user?.email,
                createdAt: session?.user?.createdAt
            },
            todos,
            exportDate: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error("Failed to export data", error)
        alert("Failed to export data. Please try again.")
    } finally {
        setIsExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you absolutely sure? This action cannot be undone. All your data (tasks, settings, and account info) will be permanently deleted.")) {
        return
    }
    
    setIsUpdating(true)
    try {
        // 1. Delete user data (tasks) from our backend
        await apiClient.delete('/user/data')
        
        // 2. Delete user account from the auth system
        // This will also cascade delete sessions and accounts in the DB
        await authClient.deleteUser()
        
        // 3. Redirect to landing page
        router.push("/")
    } catch (error) {
        console.error("Failed to delete account", error)
        alert("An error occurred during account deletion. Please try again.")
        setIsUpdating(false)
    }
  }

  const toggleNotifications = async (checked: boolean) => {
    if (checked) {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications")
            return
        }
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
            setNotificationsEnabled(true)
            localStorage.setItem("notificationsEnabled", "true")
        } else {
            setNotificationsEnabled(false)
            localStorage.setItem("notificationsEnabled", "false")
        }
    } else {
        setNotificationsEnabled(false)
        localStorage.setItem("notificationsEnabled", "false")
    }
  }

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
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
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={image || `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(session.user.email)}`} />
                  <AvatarFallback>
                    {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center md:text-left flex flex-col gap-2">
                  <h3 className="text-lg font-medium">{session.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Button variant="outline" size="sm" onClick={handleRandomizeAvatar} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                        Randomize
                    </Button>
                    <div className="relative">
                        <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUpdating}
                        />
                        <Button variant="outline" size="sm" disabled={isUpdating} className="pointer-events-none">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUpdating}>
                        <X className="mr-2 h-4 w-4" />
                        Remove
                    </Button>
                  </div>
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
                    disabled={isUpdating}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    disabled 
                    className="bg-muted"
                  />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Email addresses cannot be changed directly for security reasons.
                  </p>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
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
                        onCheckedChange={toggleNotifications}
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
                    <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
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
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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