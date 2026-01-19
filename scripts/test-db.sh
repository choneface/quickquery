#!/bin/bash

set -e

CONTAINER_NAME="qq-test-postgres"
DB_NAME="testdb"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT="5433"
JDBC_URL="jdbc:postgresql://localhost:${DB_PORT}/${DB_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "Cleaning up existing container..."
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
}

start_postgres() {
    log_info "Starting PostgreSQL container..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -e POSTGRES_DB="$DB_NAME" \
        -p "${DB_PORT}:5432" \
        postgres:latest

    log_info "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            log_info "PostgreSQL is ready!"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    log_error "PostgreSQL failed to start within 30 seconds"
    exit 1
}

run_query() {
    local query="$1"
    local description="$2"

    log_info "Running: $description"
    PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" node dist/index.js --headless "$JDBC_URL" -c "$query"
}

create_schema() {
    log_info "Creating database schema..."

    run_query "
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT true
        )
    " "Create users table"

    run_query "
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock INTEGER DEFAULT 0,
            category VARCHAR(50)
        )
    " "Create products table"

    run_query "
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            total_amount DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    " "Create orders table"

    run_query "
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10, 2) NOT NULL
        )
    " "Create order_items table"
}

populate_data() {
    log_info "Populating test data..."

    run_query "
        INSERT INTO users (username, email, is_active) VALUES
        ('alice', 'alice@example.com', true),
        ('bob', 'bob@example.com', true),
        ('charlie', 'charlie@example.com', false),
        ('diana', 'diana@example.com', true),
        ('eve', 'eve@example.com', true)
    " "Insert users"

    run_query "
        INSERT INTO products (name, description, price, stock, category) VALUES
        ('Laptop', 'High-performance laptop with 16GB RAM', 999.99, 50, 'Electronics'),
        ('Wireless Mouse', 'Ergonomic wireless mouse', 29.99, 200, 'Electronics'),
        ('USB-C Cable', '2m braided USB-C cable', 12.99, 500, 'Accessories'),
        ('Monitor Stand', 'Adjustable aluminum monitor stand', 79.99, 75, 'Accessories'),
        ('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 149.99, 100, 'Electronics'),
        ('Webcam HD', '1080p HD webcam with microphone', 59.99, 150, 'Electronics'),
        ('Desk Lamp', 'LED desk lamp with adjustable brightness', 34.99, 80, 'Office'),
        ('Notebook', 'A5 lined notebook, 200 pages', 8.99, 300, 'Office'),
        ('Pen Set', 'Set of 10 gel pens', 14.99, 250, 'Office'),
        ('Coffee Mug', 'Insulated stainless steel mug', 19.99, 120, 'Kitchen')
    " "Insert products"

    run_query "
        INSERT INTO orders (user_id, total_amount, status) VALUES
        (1, 1042.97, 'completed'),
        (1, 29.99, 'completed'),
        (2, 229.98, 'shipped'),
        (2, 79.99, 'pending'),
        (4, 164.98, 'completed'),
        (5, 1029.98, 'processing')
    " "Insert orders"

    run_query "
        INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
        (1, 1, 1, 999.99),
        (1, 3, 2, 12.99),
        (1, 8, 2, 8.99),
        (2, 2, 1, 29.99),
        (3, 5, 1, 149.99),
        (3, 4, 1, 79.99),
        (4, 4, 1, 79.99),
        (5, 6, 2, 59.99),
        (5, 7, 1, 34.99),
        (5, 9, 1, 14.99),
        (6, 1, 1, 999.99),
        (6, 2, 1, 29.99)
    " "Insert order items"
}

verify_data() {
    log_info "Verifying data..."
    echo ""

    echo "=== Users ==="
    PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" node dist/index.js --headless "$JDBC_URL" -c "SELECT * FROM users"
    echo ""

    echo "=== Products ==="
    PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" node dist/index.js --headless "$JDBC_URL" -c "SELECT id, name, price, stock, category FROM products"
    echo ""

    echo "=== Orders ==="
    PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" node dist/index.js --headless "$JDBC_URL" -c "SELECT * FROM orders"
    echo ""

    echo "=== Order Summary ==="
    PGUSER="$DB_USER" PGPASSWORD="$DB_PASSWORD" node dist/index.js --headless "$JDBC_URL" -c "
        SELECT
            u.username,
            COUNT(o.id) as order_count,
            SUM(o.total_amount) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        GROUP BY u.id, u.username
        ORDER BY total_spent DESC NULLS LAST
    "
}

print_connection_info() {
    echo ""
    log_info "Test database is ready!"
    echo ""
    echo "Connection details:"
    echo "  Host:     localhost"
    echo "  Port:     $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User:     $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo "To connect with qq:"
    echo "  qq $JDBC_URL"
    echo ""
    echo "To stop the container:"
    echo "  docker rm -f $CONTAINER_NAME"
    echo ""
}

# Main
case "${1:-}" in
    "stop")
        cleanup
        log_info "Container stopped and removed"
        ;;
    "status")
        if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            log_info "Container is running"
            print_connection_info
        else
            log_warn "Container is not running"
        fi
        ;;
    *)
        cleanup
        start_postgres
        create_schema
        populate_data
        verify_data
        print_connection_info
        ;;
esac
