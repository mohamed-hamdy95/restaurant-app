# node-js-sample

A barebones Node.js app using [Express 4](http://expressjs.com/).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Postgress SQL](https://www.postgresql.org/download/) installed.

```sh
git clone https://github.com/mohamed-hamdy95/restaurant-app.git # or clone your own fork
cd restaurant-app
npm install
node index.js
```

Your app should now be running on [localhost:8080](http://localhost:8080/).

### Test

Make sure you have [Mocha](https://www.npmjs.com/package/mocha)

```sh
npm install -g mocha
# then run this in the application root directory
mocha
```

## File Structure

📦src  
┣ 📂config  
┃ ┣ 📜auth.config.js  
┃ ┗ 📜db.config.js  
┣ 📂controllers  
┃ ┣ 📜auth.controller.js  
┃ ┣ 📜table.controller.js  
┃ ┗ 📜reservation.controller.js
┣ 📂helpers  
┃ ┗ 📜query.helper.js
┣ 📂middleware  
┃ ┣ 📜authJwt.js  
┃ ┣ 📜index.js  
┃ ┗ 📜verifySignUp.js
┣ 📂models  
┃ ┣ 📜index.controller.js  
┃ ┣ 📜table.model.js
┃ ┣ 📜role.model.js  
┃ ┣ 📜user.model.js  
┃ ┗ 📜reservation.model.js
┣ 📂routes  
┃ ┣ 📜auth.routes.js  
┃ ┣ 📜table.routes.js  
┃ ┗ 📜reservation.routes.js
┣ 📂test
┃ ┗ 📜test.js
┗ 📜index.js

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

-  Open Postgress SQL Shell.
-  login
-  create the database using the following command.

```sh
CREATE DATABASE restaurant;
```
