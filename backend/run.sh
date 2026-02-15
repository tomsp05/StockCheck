#!/bin/bash
# Build and run the StockCheck backend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Database setup ──
DB_NAME="stockcheck"
export JDBC_DATABASE_URL="jdbc:postgresql://localhost:5432/$DB_NAME"
export JDBC_DATABASE_USER="$(whoami)"
export JDBC_DATABASE_PASSWORD=""

# Ensure PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 2
    if ! pg_isready -q 2>/dev/null; then
        echo "Error: PostgreSQL failed to start." >&2
        exit 1
    fi
fi
echo "PostgreSQL is running."

# Create database if it doesn't exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating database '$DB_NAME'..."
    createdb "$DB_NAME"
fi

# ── Build and run ──
bash "$SCRIPT_DIR/build.sh"
echo ""
echo "Starting server on port ${1:-8080}..."
java -cp "$SCRIPT_DIR/out:$SCRIPT_DIR/lib/*" com.stockcheck.StockCheckApplication "${1:-8080}"
