# Makefile for managing microservices

# Service directories
API_GATEWAY=backend/api-gateway
INVENTORY_SERVICE=backend/inventory-service
ORDER_SERVICE=backend/order-service
USER_SERVICE=backend/user-service

.PHONY: all up down restart logs

all: up

up:
    docker-compose -f backend/docker-compose.yml up -d

down:
    docker-compose -f backend/docker-compose.yml down

restart:
    docker-compose -f backend/docker-compose.yml restart

logs:
    docker-compose -f backend/docker-compose.yml logs -f

# Individual service commands
start-api-gateway:
    cd $(API_GATEWAY) && npm install && npm start

start-inventory-service:
    cd $(INVENTORY_SERVICE) && npm install && npm start

start-order-service:
    cd $(ORDER_SERVICE) && npm install && npm start

start-user-service:
    cd $(USER_SERVICE) && npm install && npm start

# Add more targets as needed