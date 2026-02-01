FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

EXPOSE 8083

# Use dev mode - no build, hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8083"]
