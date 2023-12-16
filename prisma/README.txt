run the next commands while you are inside this folder in the terminal: "investo-meter-backend"

after adding a model you have to run this command first so all the models are combined into the schema:

"npx prisma-import -o "./prisma/schema.prisma" -s "./prisma/models/**/*.prisma" --force"

then go to schema.prisma and paste this code
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

```
then run the application using "npm run start"