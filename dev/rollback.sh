#!/bin/bash
set -e

TARGET_DIR="$(pwd)"
SNAPSHOT_DIR="$TARGET_DIR"

echo "🛑 WARNING: This will delete ALL files in: $TARGET_DIR (except hidden files)."
read -p "Are you absolutely sure? Type YES to continue: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  echo "❌ Aborted."
  exit 1
fi

echo "📦 Available Snapshots:"
select SNAPSHOT_FILE in "$SNAPSHOT_DIR"/*.tar.gz; do
  if [[ -n "$SNAPSHOT_FILE" ]]; then
    HASH_FILE="${SNAPSHOT_FILE%.tar.gz}.sha256"

    echo "🔍 Verifying SHA256 integrity of selected snapshot..."
    sha256sum -c "$HASH_FILE"

    echo "🔥 Deleting all non-hidden files in $TARGET_DIR..."
    find "$TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name '.*' -exec rm -rf {} +

    echo "📂 Restoring snapshot: $SNAPSHOT_FILE"
    tar -xvzf "$SNAPSHOT_FILE" -C "$TARGET_DIR"

    echo "✅ Rollback complete."
    exit 0
  else
    echo "❌ Invalid selection."
  fi
done
