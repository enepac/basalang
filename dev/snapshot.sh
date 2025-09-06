#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d_%H-%M-%S)
ARCHIVE="snapshot_$DATE.tar.gz"
HASHFILE="snapshot_$DATE.sha256"

SNAPSHOT_DIR="/workspaces/basalang/dev/snapshots"

cd /workspaces/basalang

echo "📦 Creating tarball..."
tar \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude="./dev/snapshots/*" \
  -czf "$SNAPSHOT_DIR/$ARCHIVE" .

echo "🔒 Calculating hash..."
sha256sum "$SNAPSHOT_DIR/$ARCHIVE" > "$SNAPSHOT_DIR/$HASHFILE"

echo "🔍 Verifying archive integrity..."
sha256sum -c "$SNAPSHOT_DIR/$HASHFILE"

echo "✅ Snapshot complete and verified:"
echo "🔹 Archive: $ARCHIVE"
echo "🔹 Hash: $(cat $SNAPSHOT_DIR/$HASHFILE)"
