FROM node:8-alpine
WORKDIR /usr/app
COPY . .
RUN npm install --quiet