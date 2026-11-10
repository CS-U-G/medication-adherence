FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public/ ./public/
COPY src/ ./src/
COPY scripts/ ./scripts/
ARG MEDMINDER_API_URL=""
ENV MEDMINDER_API_URL=${MEDMINDER_API_URL}
RUN npm run configure
RUN npm run build -- --configuration production \
    && test -f dist/medication-adherence-admin/browser/index.html

FROM nginx:stable-alpine
ENV PORT=10000
ENV NGINX_ENVSUBST_FILTER="^PORT$"

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY nginx-security.conf /etc/nginx/snippets/medminder-security.conf
COPY --from=build /app/dist/medication-adherence-admin/browser/ /usr/share/nginx/html/

EXPOSE 10000
