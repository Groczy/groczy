# How to Run Groczy Web App

## Important: Must run on HTTP/HTTPS server

The web app **CANNOT** be opened directly by double-clicking `index.html` (file:// protocol).
Google Sign-In requires HTTP/HTTPS protocol.

## Option 1: Python Server (Easiest)

### If you have Python 3:
```bash
cd /Users/bhagatdeveloper/Desktop/groczyappnk
python3 -m http.server 8000
```

### If you have Python 2:
```bash
cd /Users/bhagatdeveloper/Desktop/groczyappnk
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

## Option 2: Node.js Server

### Install http-server globally:
```bash
npm install -g http-server
```

### Run server:
```bash
cd /Users/bhagatdeveloper/Desktop/groczyappnk
http-server -p 8000
```

Then open: http://localhost:8000

## Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Option 4: Deploy to Firebase Hosting

```bash
cd /Users/bhagatdeveloper/Desktop/groczyappnk
firebase deploy --only hosting
```

Then access via your Firebase hosting URL.

---

**Note:** Google Sign-In will only work when running on a proper HTTP/HTTPS server!
