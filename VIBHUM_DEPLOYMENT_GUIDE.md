# Vibhum Voice AI - Production Deployment Guide

Vibhum's voice platform uses the underlying Dograh infrastructure. This guide covers how to deploy the Vibhum engine to a production cloud instance.

## 1. Prerequisites
- A cloud instance (AWS EC2, Google Cloud Compute, DigitalOcean Droplet, etc.) running Ubuntu 22.04+
- A public IPv4 address.
- At least 4 CPU cores and 8GB RAM recommended for production telephony handling.
- Open ports: `80`, `443` (HTTP/HTTPS) and `3478`, `49152-65535` UDP (for WebRTC/TURN).
- A domain name pointing to the public IP address (e.g. `voice.vibhum.com`).

## 2. Setting Up
1. Connect to your instance via SSH.
2. Clone the Vibhum repository.
3. Configure your production secrets using the `.env.template`:
   ```bash
   cp vibhum.env.template .env
   ```
   Edit the `.env` file to include strong random secrets for `OSS_JWT_SECRET`, `TURN_SECRET`, and the database passwords. Set `SERVER_IP` and `PUBLIC_HOST`.

## 3. Automated Deployment
The repository includes an automated Let's Encrypt and NGINX setup.
Run the remote setup script as **root**:

```bash
sudo ./scripts/setup_remote.sh
```

- When prompted for **Deployment mode**, choose `build` to ensure the local `vibhum-ui` is built (instead of the upstream pre-built images).
- Follow the prompts to configure the domain name (for Let's Encrypt).
- The script will configure Docker, generate an SSL certificate, and run the stack automatically.

## 4. End-to-End Testing (Phase 6, Step 21)
Once the server is running:
1. Verify the UI is accessible securely via `https://<YOUR_DOMAIN>`.
2. Check WebRTC: Open a browser and create an agent, then try the "Test Call" button. (This uses the built-in COTURN server over UDP `3478`).
3. Check Telephony: Attach a Twilio/Vonage number in the Telephony settings and make an inbound call to verify audio flows properly.

## 5. Monitoring & Operations (Phase 6, Step 22)
The platform exposes several health and telemetry endpoints out of the box:
- `GET /api/v1/health`: General system health, version, and database connectivity.
- `GET /api/v1/health/active-calls`: Returns the number of currently running agent processes (used for graceful draining and autoscaling).
- `GET /api/v1/health/autoscale-metric`: Redis-backed active call count.

### Useful Commands
- **View logs:** `docker compose --profile remote logs -f api`
- **Restart API:** `docker compose --profile remote restart api`
- **Update Deployment:** Run `./scripts/update_remote.sh`
