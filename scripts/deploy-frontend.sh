#!/bin/bash

# How to deploy the frontend in VS Code terminal:
# bash scripts/deploy-frontend.sh

SERVER="jmodhiambo@65.108.148.147"
REMOTE_DIR="/var/www/mgltickets/mgl-frontend"

echo "Building all apps..."
npm run build

echo "Syncing admin..."
rsync -avz --delete -e "ssh -i ~/.ssh/id_ed25519" dist/admin/ $SERVER:$REMOTE_DIR/dist/admin/

echo "Syncing organizer..."
rsync -avz --delete -e "ssh -i ~/.ssh/id_ed25519" dist/organizer/ $SERVER:$REMOTE_DIR/dist/organizer/

echo "Syncing user..."
rsync -avz --delete -e "ssh -i ~/.ssh/id_ed25519" dist/user/ $SERVER:$REMOTE_DIR/dist/user/

echo "Frontend deployment complete."