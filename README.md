# Sirene Invader

## Prerequisites

- [Yarn](https://yarnpkg.com/getting-started): `npm i -g yarn`
- [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/): `npm i -g pm2`

## Getting started

```shell
cd sirene-invader
yarn
pm2 start ecosystem.config.js # you can run `yarn start` as well
```

## Features

- Thread pool to do CPU heavy work
- Efficient use of Event Emitter
- Use Readable Streams to read large file
- Efficient storage in bulk in MongoDB
