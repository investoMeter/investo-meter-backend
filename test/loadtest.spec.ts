import http from 'k6/http';
import {sleep} from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 50 },   // below normal load
    { duration: '50s', target: 50 },
    { duration: '20s', target: 100 },  // normal load
    { duration: '50s', target: 100 },
    { duration: '20s', target: 200 },  // around the breaking point
    { duration: '50s', target: 200 },
    { duration: '20s', target: 0 },    // ramp down
  ],

};

const maiAccessToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHlhcnE0aG0wMDAxMmc0OWNmeWJ4eXpsIiwibmFtZSI6Ik1haSIsInVzZXJuYW1lIjoiTWFpIiwiZW1haWwiOiJNYWlAZXhhbXBsZS5jb20iLCJpYXQiOjE3MjAzMDkzOTgsImV4cCI6MTcyMDM5NTc5OH0.wCmtjYk9bZ-Is5kOrCBOPI8o6-lCITix6xSkcYY0KO4';
const zeyadAccessToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHlhcnE0ZXowMDAwMmc0OWl6MnI1NXRrIiwibmFtZSI6IlpleWFkIiwidXNlcm5hbWUiOiJaZXlhZCIsImVtYWlsIjoiWmV5YWRAZXhhbXBsZS5jb20iLCJpYXQiOjE3MjAzMDk0MTUsImV4cCI6MTcyMDM5NTgxNX0.JcPYY9wK2EgU_aJay4khxHKzBWwRgQCh_jUr4il5uxI';
const habibaMAccessToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHlhcnE0bjgwMDA0Mmc0OWFxZjA3Zm5pIiwibmFtZSI6IkhhYmliYU0iLCJ1c2VybmFtZSI6IkhhYmliYU0iLCJlbWFpbCI6IkhhYmliYU1AZXhhbXBsZS5jb20iLCJpYXQiOjE3MjAzMDk0MzYsImV4cCI6MTcyMDM5NTgzNn0.hSst7d48WbkzML8zVoHSXCdViJv7zfrc4PdiZO9vt6A';

// Array of access tokens
const accessTokens = [maiAccessToken, zeyadAccessToken, habibaMAccessToken];

function getRandomAccessToken() {
  const randomIndex = Math.floor(Math.random() * accessTokens.length);
  return accessTokens[randomIndex];
}

export default function () {
  // const buyUrl = 'http://localhost:3333/contest-trade/buy';
  // const sellUrl = 'http://localhost:3333/contest-trade/sell'; 
  const openTradesUrl = 'http://localhost:3333/contest-trade/open-trades/?contestId=1&roomId=1'; 
  const closedTradesUrl = 'http://localhost:3333/contest-trade/closed-trades/?contestId=1&roomId=1'; 

  const payload = {
    timestamp: '2024-07-06T12:30:00',
    quantity: Math.floor(Math.random() * 10) + 1,
    price: Math.random() * (100 - 1) + 1,
    roomNumber: 1,
    contestId: 1,
    stockId: Math.floor(Math.random() * 5) + 1,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': getRandomAccessToken()
  };

  // // Send a POST request to buyUrl
  // const resBuy = http.post(buyUrl, JSON.stringify(payload), { headers: headers });
  // console.log(`Buy - Response status code: ${resBuy.status}`);
  // console.log(`Buy - Response body: ${resBuy.body}`);

  // // Send a POST request to sellUrl
  // const resSell = http.post(sellUrl, JSON.stringify(payload), { headers: headers });
  // console.log(`Sell - Response status code: ${resSell.status}`);
  // console.log(`Sell - Response body: ${resSell.body}`);

  // Send a POST request to openTradesUrl
  const resOpenTrades = http.get(openTradesUrl, { headers: headers });
  console.log(`Open Trades - Response status code: ${resOpenTrades.status}`);
  console.log(`Open Trades - Response body: ${resOpenTrades.body}`);

  // Send a POST request to openTradesUrl
  const resClosedTrades = http.get(closedTradesUrl, { headers: headers });
  console.log(`Closed Trades - Response status code: ${resClosedTrades.status}`);
  console.log(`Closed Trades - Response body: ${resClosedTrades.body}`);

  sleep(10);
}