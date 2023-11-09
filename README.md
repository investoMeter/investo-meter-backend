## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

### 1) install docker
### 2) install node version v20.9.0
### 3) install npm version 10.2.3
### 4) if node isn't installed in c Directory run this command
```bash
$ npm install -g npm
```
### 5) open terminal inside project folder
```bash
$ docker-compose up
$ npm install
$ npx prisma init
$ npx prisma db push
```
### after running docker compose up don't wait for the terminal to stop it won't open a new tab and continue the steps because the docker image will be running in this tab till you close it
### you can close the tab after running the docker compose up command and then run the image from docker desktop as it will appear

## Running the app
```bash
# development
$ npm run start
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
