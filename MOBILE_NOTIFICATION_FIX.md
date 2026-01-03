# Mobile Notification Debugging Guide

## 🔍 **Diagnosing the Issue**

### **Step 1: Access the Diagnostic Tool**

I've created a special test page that shows everything on-screen (no console needed):

**URL:** `http://your-frontend-url/test-notifications`

This page will show you exactly what's happening with notifications on your mobile device.

---

## 📱 **Testing on Your Mobile Phone**

### **Step-by-Step Instructions:**

1. **Open Chrome on your Android phone**

2. **Navigate to:** `http://your-frontend-url/test-notifications`
   - Replace `your-frontend-url` with your actual frontend URL
   - Example: `http://localhost:3000/test-notifications` (if running locally)
   - Example: `https://your-app.vercel.app/test-notifications` (if deployed)

3. **Click "1. Check Browser Support"**
   - Watch the "Live Logs" section
   - You should see: ✅ "Notification API is supported!"
   - If you see ❌ errors, screenshot them and we'll fix it

4. **Click "2. Request Permission"**
   - A browser popup should appear asking for notification permission
   - **IMPORTANT:** Click "Allow" or "Accept"
   - Watch the logs - should show: ✅ "Permission granted"

5. **Click "3. Send Test Notification"**
   - You should immediately see a notification from TaskHive
   - If you see it: **NOTIFICATIONS ARE WORKING!** 🎉
   - If not: Check the logs for error messages

6. **Click "4. Schedule Notification (10s)"**
   - Wait 10 seconds
   - You should get another notification
   - This tests if scheduled notifications work

---

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Not Supported" Message**

**Symptoms:**
- Page shows "Not Supported" status
- Logs show ❌ errors about API availability

**Possible Causes:**
1. **HTTP instead of HTTPS**: Chrome requires HTTPS for notifications (except localhost)
2. **Older Android version**: Needs Android 5.0+ and Chrome 50+
3. **Browser restrictions**: Some custom Android browsers don't support it

**Solutions:**
- If testing locally: Use `http://localhost:3000` (this works without HTTPS)
- If deployed: **MUST use HTTPS** (most hosting provides this free)
- Try Chrome version 90+ on Android

---

### **Issue 2: Permission Shows "denied"**

**Symptoms:**
- Status shows "Denied"
- Cannot send test notifications
- Logs show: ❌ "Permission denied"

**Solutions:**
1. **Reset Chrome permissions:**
   - Go to Chrome Settings
   - Site Settings → Notifications
   - Find your site → Change to "Allow"

2. **Or reset entirely:**
   - Chrome → Settings → Privacy → Clear browsing data
   - Select "Site settings" → Clear
   - Reload page and grant permission again

---

### **Issue 3: Permission Shows "default" but notifications don't appear**

**Symptoms:**
- Permission is not "denied" but not "granted" either
- No permission popup appears
- Logs show: ⚠️ "Permission default"

**Solutions:**
1. **Manually enable notifications:**
   - Chrome → Three dots → Site information (lock icon)
   - Permissions → Notifications → Allow

2. **Check Android system settings:**
   - Android Settings → Apps → Chrome → Notifications
   - Ensure notifications are enabled for Chrome

---

### **Issue 4: HTTPS Requirement**

**IMPORTANT:** Web Notifications require HTTPS in production!

**Exceptions (work without HTTPS):**
- ✅ `http://localhost:*` (local development)
- ✅ `http://127.0.0.1:*` (local development)
- ❌ `http://your-ip-address:*` (requires HTTPS)
- ❌ `http://your-domain.com` (requires HTTPS)

**If you're testing on deployed site:**
- Deploy to platforms that provide free HTTPS:
  - Vercel (automatic HTTPS)
  - Netlify (automatic HTTPS)
  - Railway (automatic HTTPS)
  - GitHub Pages (automatic HTTPS)

---

## 🛠️ **Debugging Steps**

### **If Test Page Shows Issues:**

1. **Take screenshots** of the diagnostic page showing:
   - System Status section
   - All logs in the Live Logs section

2. **Check these details:**
   - Are you using HTTP or HTTPS? (look at browser address bar)
   - What's your Chrome version? (Chrome → Settings → About Chrome)
   - What's your Android version? (Settings → About phone)

3. **Try these URLs on mobile:**
   ```
   http://localhost:3000/test-notifications   (if running locally)
   https://your-app.vercel.app/test-notifications   (if deployed)
   ```

---

## 🔧 **Quick Fixes**

### **If Testing Locally:**

1. **Start your Next.js dev server:**
   ```bash
   cd phase-2/frontend
   npm run dev
   ```

2. **Access from mobile on same WiFi:**
   - Find your computer's IP address
   - BUT use `localhost` tunnel instead (see below)

3. **Better: Use Vercel/Railway for free HTTPS:**
   ```bash
   # Deploy to Vercel (free HTTPS)
   vercel --prod
   ```

### **If Deployed but Not Working:**

1. **Verify HTTPS is enabled:**
   - Browser should show 🔒 lock icon
   - URL should start with `https://`

2. **Check deployment logs:**
   - Ensure Next.js built successfully
   - Check for any build errors

3. **Test with diagnostic page:**
   - `https://your-domain/test-notifications`
   - Follow the 4 steps
   - Watch for any errors in the on-screen logs

---

## 📋 **Checklist Before Reporting Issue**

- [ ] Tested on `/test-notifications` page
- [ ] Using Chrome on Android (version 90+)
- [ ] Using HTTPS (or localhost for development)
- [ ] Clicked "Allow" when permission popup appeared
- [ ] Chrome notifications are enabled in Android settings
- [ ] Site notifications are not blocked in Chrome settings
- [ ] Screenshot of diagnostic page status
- [ ] Screenshot of any error messages in logs

---

## 💡 **Expected Behavior**

### **When Everything Works:**

1. **Diagnostic Page Shows:**
   - ✅ Status: "Ready"
   - ✅ Notification API: "Supported"
   - ✅ Permission Status: "granted"
   - ✅ Overall Status: "Ready"

2. **Logs Show:**
   ```
   🔍 Checking browser support...
   ✅ Notification API is supported!
   📋 Current permission: default
   🔔 Requesting notification permission...
   ✅ Permission granted: granted
   📤 Attempting to send test notification...
   ✅ Test notification sent successfully!
   ```

3. **You See:**
   - Notification appears at top of phone
   - Shows "TaskHive Test"
   - Body text: "If you see this, notifications are working! 🎉"

---

## 🚀 **Next Steps**

### **Once Notifications Work on Test Page:**

The same notification system is used throughout the app. If test page works, then:

1. **Go to Todo page:** `/todos`
2. **Create a task** with due date 6 minutes from now
3. **Wait:** You'll get notifications at 5min and 1min before due time

### **If Test Page Works But Todo Page Doesn't:**

This means there's an issue in the `use-mock-todos.ts` hook. We'll need to debug that separately.

---

## 📞 **If Still Not Working**

**Provide these details:**

1. Screenshot of `/test-notifications` page showing:
   - System Status section
   - All logs

2. Your setup:
   - URL you're using (HTTP or HTTPS?)
   - Chrome version (Chrome → Settings → About)
   - Android version (Settings → About phone)

3. What happens when you:
   - Click "Request Permission" - Does popup appear?
   - Click "Send Test Notification" - Any notification?
   - What do the logs say?

With this information, I can provide a specific fix for your situation.

---

## 🎯 **Summary**

**The diagnostic tool at `/test-notifications` will tell you exactly what's wrong.**

Common solutions:
- ✅ Use HTTPS (not HTTP) in production
- ✅ Click "Allow" when permission popup appears
- ✅ Check Chrome notification settings
- ✅ Use Chrome 90+ on Android 5.0+

**Test the diagnostic page and share screenshots if issues persist!** 📱
