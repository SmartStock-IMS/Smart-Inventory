# SmartStock Microservices Architecture

This project converts the SmartStock Inventory Management System from a monolithic architecture to a microservices architecture with the following services:

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │────│   API Gateway    │
│  (React/Vite)   │    │   Port: 3000     │
└─────────────────┘    └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │User Service │ │Inventory    │ │Order       │
        │Port: 3001   │ │Service      │ │Service     │
        └─────────────┘ │Port: 3002   │ │Port: 3003  │
                |        └─────────────┘ └────────────┘
                |                │               │
                |                └───────┬───────┘
                |                        │
                |_______________┌───────▼────────┐
                                │   PostgreSQL   │
                                │   Port: 5432   │
                                └────────────────┘
```

## Services

### 1. API Gateway (Port: 3000)

- **Responsibility**: Request routing, authentication, rate limiting
- **Routes**:
  - `/api/auth/*` → User Service
  - `/api/users/*` → User Service
  - `/api/products/*` → Inventory Service
  - `/api/inventory/*` → Inventory Service
  - `/api/orders/*` → Order Service
  - `/api/customers/*` → Order Service

### 2. User Service (Port: 3001)

- **Responsibility**: User management, authentication, authorization
- **Database**: `smartstock_users`
- **Features**:
  - User registration and login
  - JWT token management
  - Role-based access control
  - User profile management

### 3. Inventory Service (Port: 3002)

- **Responsibility**: Product and inventory management
- **Database**: `smartstock_inventory`
- **Features**:
  - Product CRUD operations
  - Variant management
  - Inventory level tracking
  - Stock reservations
  - Low stock alerts

### 4. Order Service (Port: 3003)

- **Responsibility**: Order and customer management
- **Database**: `smartstock_orders`
- **Features**:
  - Order processing
  - Customer management
  - Quotation management
  - Sales reporting
  - Integration with Inventory Service

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to the microservices directory:

```bash
cd d:\\MyProjects\\project1-git\\un\\Smart-Inventory\\microservices
```

2. Start all services with Docker Compose:

```bash
docker-compose up -d
```

3. Check service health:

```bash
# API Gateway
curl http://localhost:3000/health

# User Service
curl http://localhost:3001/health

# Inventory Service
curl http://localhost:3002/health

# Order Service
curl http://localhost:3003/health
```

### Option 2: Local Development

1. Install dependencies for each service:

```bash
# API Gateway
cd api-gateway && npm install

# User Service
cd ../user-service && npm install

# Inventory Service
cd ../inventory-service && npm install

# Order Service
cd ../order-service && npm install
```

2. Set up environment variables:

```bash
# Copy example files and update with your values
cp api-gateway/.env.example api-gateway/.env
cp user-service/.env.example user-service/.env
cp inventory-service/.env.example inventory-service/.env
cp order-service/.env.example order-service/.env
```

3. Start PostgreSQL and create databases:

```sql
CREATE DATABASE smartstock_users;
CREATE DATABASE smartstock_inventory;
CREATE DATABASE smartstock_orders;
```

4. Start services in separate terminals:

```bash
# Terminal 1 - API Gateway
cd api-gateway && npm run dev

# Terminal 2 - User Service
cd user-service && npm run dev

# Terminal 3 - Inventory Service
cd inventory-service && npm run dev

# Terminal 4 - Order Service
cd order-service && npm run dev
```

## API Documentation

### Authentication Flow

1. **Register/Login**: POST `/api/auth/login` or `/api/auth/register`
2. **Get Access Token**: Use the returned `accessToken` in the `Authorization` header
3. **Access Protected Routes**: `Authorization: Bearer <token>`

### Example API Calls

#### User Management

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "sales_rep"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

#### Product Management

```bash
# Create a product (requires authentication)
curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "Electronics",
    "price": 999.99,
    "cost": 750.00
  }'

# Get all products
curl -X GET http://localhost:3000/api/products \\
  -H "Authorization: Bearer <your-token>"
```

#### Order Management

```bash
# Create an order
curl -X POST http://localhost:3000/api/orders \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <your-token>" \\
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "product_name": "Laptop",
        "product_sku": "SKU-123",
        "quantity": 2,
        "unit_price": 999.99
      }
    ],
    "notes": "Urgent order"
  }'
```

## Database Schema

### User Service Tables

- `users`: User accounts and authentication
- `user_sessions`: Active user sessions (optional)

### Inventory Service Tables

- `products`: Product catalog
- `variants`: Product variants
- `inventory`: Stock levels and locations

### Order Service Tables

- `customers`: Customer information
- `orders`: Order headers
- `order_items`: Order line items
- `quotations`: Sales quotations

## Development Guidelines

### Adding New Features

1. Identify which service the feature belongs to
2. Create appropriate models, controllers, and routes
3. Update API Gateway routing if needed
4. Add validation and error handling
5. Update documentation

### Inter-Service Communication

Services communicate via HTTP APIs. The Order Service calls the Inventory Service for stock operations.

Example:

```javascript
// In Order Service
const inventoryService = require("../services/inventoryService");
await inventoryService.reserveInventory(productId, quantity);
```

### Database Migrations

Each service manages its own database schema. Use Sequelize migrations for schema changes:

```bash
# Generate a new migration
npx sequelize-cli migration:generate --name add-new-field

# Run migrations
npx sequelize-cli db:migrate
```

## Monitoring and Health Checks

All services provide health check endpoints:

- API Gateway: `GET /health`
- User Service: `GET /health`
- Inventory Service: `GET /health`
- Order Service: `GET /health`

## Security Considerations

1. **JWT Authentication**: All protected routes require valid JWT tokens
2. **CORS**: Configured to allow requests from the frontend
3. **Rate Limiting**: API Gateway implements rate limiting
4. **Input Validation**: All inputs are validated using express-validator
5. **Security Headers**: Helmet.js provides security headers

## Scaling Considerations

1. **Horizontal Scaling**: Each service can be scaled independently
2. **Database Isolation**: Each service has its own database
3. **Stateless Services**: All services are stateless for easy scaling
4. **Load Balancing**: API Gateway can be load balanced

## Troubleshooting

### Common Issues

1. **Service Connection Errors**: Check if all services are running and accessible
2. **Database Connection**: Verify PostgreSQL is running and credentials are correct
3. **Authentication Issues**: Ensure JWT secrets are consistent across services
4. **CORS Errors**: Check CORS configuration in API Gateway

### Logs

Each service logs to the console. In production, consider using a centralized logging solution.

## Future Enhancements

1. **Service Discovery**: Implement Consul or similar for service discovery
2. **Message Queues**: Add Redis/RabbitMQ for asynchronous communication
3. **API Documentation**: Add Swagger/OpenAPI documentation
4. **Monitoring**: Implement Prometheus/Grafana for monitoring
5. **CI/CD**: Add automated testing and deployment pipelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the ISC License.
