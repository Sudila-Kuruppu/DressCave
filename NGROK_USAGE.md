# Ngrok Usage for DressCave

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