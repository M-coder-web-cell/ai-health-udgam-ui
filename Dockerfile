# ---------- Build stage ----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    # ---------- Production stage ----------
    FROM nginx:alpine
    
    # Remove default nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Copy custom nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Copy built frontend
    COPY --from=builder /app/dist /usr/share/nginx/html
    # If CRA, use /app/build instead of /app/dist
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    