# SmartStock Microservices - Development Setup

## Quick Start Commands

### Start all services with Docker Compose

```bash
cd microservices
docker-compose up -d
```

### Start services individually for development

```bash
# Start PostgreSQL first
docker run --name smartstock-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15

# Create databases
psql -h localhost -U postgres -c "CREATE DATABASE smartstock_users;"
psql -h localhost -U postgres -c "CREATE DATABASE smartstock_inventory;"
psql -h localhost -U postgres -c "CREATE DATABASE smartstock_orders;"

# Start services in separate terminals
cd api-gateway && npm run dev
cd user-service && npm run dev
cd inventory-service && npm run dev
cd order-service && npm run dev
```

### API Testing Examples

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","email":"admin@test.com","password":"password123","first_name":"Admin","last_name":"User","role":"admin"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password123"}'

# Create a product (replace TOKEN with actual token from login)
curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"name":"Test Product","category":"Electronics","price":99.99,"cost":50.00}'
```

## Architecture Complete ✅

The SmartStock backend has been successfully divided into 3 microservices:

1. **User Service** - Authentication & user management
2. **Inventory Service** - Products & stock management
3. **Order Service** - Orders, customers & quotations
4. **API Gateway** - Request routing & authentication
