# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ARG VITE_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_URL=$VITE_URL

COPY . .
RUN npm run build

# Stage 2: Serve the build with a static server
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]

