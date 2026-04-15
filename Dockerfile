# ======================
# 1. Build stage
# ======================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for Yarn 4
RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install --immutable

COPY . .

RUN yarn build


# ======================
# 2. Production stage
# ======================
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]