# Sirene Invader

## Prerequisites

- [Yarn](https://yarnpkg.com/getting-started): `npm i -g yarn`
- [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/): `npm i -g pm2`

## Getting started

```shell
yarn
pm2 start process.js # you can run `yarn start:node` as well
```

## Features

- Thread pool to CPU heavy work
- Use Readable Streams to read large file
- Efficient storage in bulk in MongoDB
