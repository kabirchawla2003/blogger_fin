#!/bin/bash
# Deployment script for Linux VPS

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install dependencies
npm ci

# Create data and uploads directories
mkdir -p data public/uploads

# Set permissions
chmod 755 data public/uploads

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "Deployment complete!"
