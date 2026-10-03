#!/bin/bash
# Azure Deployment Script for BuildPay AI
# Deploys FastAPI Backend to Azure Container Apps and Next.js Frontend to Azure Static Web Apps / Container Apps

set -e

RESOURCE_GROUP="rg-buildpay-ai-prod"
LOCATION="eastus"
ACR_NAME="acrbuildpayai"
BACKEND_APP="app-buildpay-backend"
FRONTEND_APP="app-buildpay-frontend"
POSTGRES_SERVER="psql-buildpay-ai"

echo "=== BuildPay AI Azure Deployment Pipeline ==="

# 1. Create Resource Group
echo "Creating Azure Resource Group: $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Create Azure Container Registry
echo "Creating Azure Container Registry: $ACR_NAME..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Log in to ACR
az acr login --name $ACR_NAME

# 3. Build & Push Backend Container Image
echo "Building & Pushing Backend Docker image..."
docker build -t $ACR_NAME.azurecr.io/backend:latest ./backend
docker push $ACR_NAME.azurecr.io/backend:latest

# 4. Build & Push Frontend Container Image
echo "Building & Pushing Frontend Docker image..."
docker build -t $ACR_NAME.azurecr.io/frontend:latest ./frontend
docker push $ACR_NAME.azurecr.io/frontend:latest

# 5. Create Azure Container Apps Environment
echo "Creating Container Apps Environment..."
az containerapp env create \
  --name "env-buildpay-ai" \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# 6. Deploy Backend Container App
echo "Deploying Backend Container App..."
az containerapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --environment "env-buildpay-ai" \
  --image $ACR_NAME.azurecr.io/backend:latest \
  --target-port 8000 \
  --ingress external \
  --env-vars \
    ENVIRONMENT=production \
    SECRET_KEY=production-secret-key-change-me \
    GROQ_API_KEY=$GROQ_API_KEY

# 7. Deploy Frontend Container App
echo "Deploying Frontend Container App..."
BACKEND_URL=$(az containerapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

az containerapp create \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --environment "env-buildpay-ai" \
  --image $ACR_NAME.azurecr.io/frontend:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars \
    NEXT_PUBLIC_API_URL=https://$BACKEND_URL/api/v1

echo "=== BuildPay AI Deployment Successful! ==="
echo "Backend Endpoint: https://$BACKEND_URL"
echo "Frontend Endpoint: https://$(az containerapp show --name $FRONTEND_APP --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)"
