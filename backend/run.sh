#!/bin/bash
# Build and run the StockCheck backend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$SCRIPT_DIR/build.sh"
echo ""
echo "Starting server..."
java -cp "$SCRIPT_DIR/out:$SCRIPT_DIR/lib/*" com.stockcheck.StockCheckApplication "${1:-8080}"
