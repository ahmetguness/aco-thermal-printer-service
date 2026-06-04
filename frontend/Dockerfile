FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:3003
ARG VITE_API_ACCESS_TOKEN=test-token-1234

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_ACCESS_TOKEN=$VITE_API_ACCESS_TOKEN

COPY package*.json ./
RUN npm ci

COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
