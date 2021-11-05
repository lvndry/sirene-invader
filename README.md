# Sirene Invader

## Prerequisites

- [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/): `npm i -g pm2`
- [MongoDB](https://docs.mongodb.com/manual/installation/)

## Getting started

```shell
yarn # or npm install
pm2 start ecosystem.config.js # you can run `yarn start:node` as well
```

## Features

- Thread pool to CPU heavy work
- Use Readable Streams to read large file
- Efficient storage in bulk in MongoDB
