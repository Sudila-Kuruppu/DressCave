# Ngrok Usage for DressCave

⚠️ **For development only - exposes local server publicly**

## Initial Setup (ngrok v3)

Before using ngrok, you need to authenticate with your ngrok account:

1. Sign up at [ngrok.com](https://ngrok.com) and get your authtoken
2. Add your authtoken to ngrok configuration:
```bash
ngrok config add-authtoken <your_token_here>
```

## Basic Usage

1. Start the development server:
```bash
npm run dev
```

2. Create an ngrok tunnel on port 3000:
```bash
ngrok http 3000
```

3. Use the provided https URL to access the application from external devices

## Configuration

The dev.nix environment includes ngrok by default. No additional installation needed.

## Common Commands

- `ngrok http <port>` - Tunnel HTTP traffic on specified port
- `ngrok version` - Check ngrok version
- `ngrok help` - Display help information
- `ngrok config check` - Verify ngrok configuration

## Troubleshooting

### Port Already in Use
**Error:** `bind: address already in use`

**Solution:**
- Check what's running on the port: `lsof -i :3000`
- Stop the conflicting process or use a different port

### Connection Errors
**Error:** `Failed to complete tunnel connection`

**Solutions:**
1. Verify your authtoken is configured: `ngrok config check`
2. Check your internet connection
3. Restart ngrok: Stop (Ctrl+C) and run again
4. Verify the target port has an active server running

### ngrok Configuration Issues
**Error:** `ngrok config file not found or invalid`

**Solution:**
- Re-add your authtoken: `ngrok config add-authtoken <token>`
- Check ngrok is properly installed in the dev.nix environment

### URL Not Accessible
**Symptom:** ngrok provides URL but page doesn't load

**Solutions:**
1. Ensure your dev server is running on the specified port
2. Check ngrok terminal for error messages
3. Try restarting both ngrok and the dev server