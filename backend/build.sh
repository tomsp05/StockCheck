#!/bin/bash
# Build the StockCheck backend (no external dependencies required)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src/main/java"
OUT_DIR="$SCRIPT_DIR/out"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "Compiling..."
find "$SRC_DIR" -name "*.java" > /tmp/stockcheck-sources.txt
javac -d "$OUT_DIR" -cp "$SCRIPT_DIR/lib/*" @/tmp/stockcheck-sources.txt

echo "Build successful. Run with:"
echo "  java -cp $OUT_DIR com.stockcheck.StockCheckApplication"
