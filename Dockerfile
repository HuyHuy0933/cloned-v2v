FROM node:16 as build-stage
WORKDIR /app
COPY . .

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/nginx.conf /etc/nginx/nginx.conf