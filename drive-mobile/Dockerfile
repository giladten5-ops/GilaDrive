# Use a Node.js image as the base
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash git

COPY package*.json ./

RUN npm install

COPY . .

# Expose ports used by Expo Bundler
EXPOSE 8081

RUN npm install -g @expo/ngrok@^4.1.0

CMD ["npx", "expo", "start", "--tunnel"]