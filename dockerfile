FROM alpine AS packages
RUN apk add --no-cache g++
RUN apk add --update nodejs npm
WORKDIR /app
COPY . .
CMD ["mkdir", "temp"]
RUN npm install

FROM packages AS serve
CMD ["npm", "start"]
