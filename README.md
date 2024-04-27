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

### 5) building docker images

#### 5-1) clone investo-meter-hints-service

#### 5-2) clone investo-meter-contests-service

#### 5-3) open a bash terminal inside each one of them

#### 5-4) run this command

```bash
$ docker build -t hints-microservices .
$ docker build -t contest-broadcast-microservices .
```

### 6) open terminal inside investo-meter-backend folder

```bash
$ docker-compose up -d
$ npm install
$ npx prisma generate
$ npx prisma db push
```

### after finishing all of those commands go to docker desktop application and if any image is not running run them manually again

### "sometimes this happens because the db didnt run and they need to connect to db so they fail and exit"

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
