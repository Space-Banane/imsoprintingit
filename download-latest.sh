#!/bin/sh

# Set default repo if not provided
REPO=${GITHUB_REPO}

echo "Downloading latest release from $REPO..."

# Get latest release info
LATEST_RELEASE=$(curl -s "https://api.github.com/repos/$REPO/releases/latest")

# Extract download URL for dist.zip
DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep -o '"browser_download_url": "[^"]*dist\.zip"' | cut -d'"' -f4)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "No dist.zip found in latest release"
    exit 1
fi

echo "Downloading from: $DOWNLOAD_URL"

# Download and extract
curl -L "$DOWNLOAD_URL" -o /tmp/dist.zip
unzip -o /tmp/dist.zip -d /usr/share/nginx/html/
rm /tmp/dist.zip

echo "Latest release extracted to /usr/share/nginx/html/"
