run the next commands while you are inside the main project folder in the terminal: "investo-meter-backend"

after adding a model you have to run these commands in their order
```
npx prisma-import -o './prisma/schema.prisma' -s './prisma/models/**/*.prisma' --force

cat prisma/schema-connection.txt >> prisma/schema.prisma

npm run start
```
then run the application using "npm run start"