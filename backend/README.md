# How to host things locally

## Mongo database
> This has to be done first so the server has a database ready to connect to.
1. Make sure you have `node` on your computer
2. Go to the backend folder in terminal.
3. Install [mongo](https://www.mongodb.com/download-center?_ga=2.227195413.969726807.1522118681-159605336.1518643578#production) on your computer.
4. Follow to learn how to [host mongo locally](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition) up to step 4!
Step 4 will open up a commandline tool that allows you to navigate through your hosted database called `mongoshell`! Here's [some basic commands](https://docs.mongodb.com/manual/mongo/#working-with-the-mongo-shell)
> It's recommended to add these commands to npm's "start" scripts. It'll make your life easier. Just make sure the paths are consistent with whatever's in this backend folder.

## Server:
1. Run `npm start` to start express server. It will be hosted on `localhost:3000`. 
NOTE: It has been setup in such that any changes to the server will automatically be reloaded! ([nodemon!](https://github.com/remy/nodemon))

Now you're all set!

## Notes
There are currently 3 important things of note:
1. `models`
    - where schemas and database function should be defined
2. `routes`
    - where server endpoints are defined
    - should use stuff defined in models to interact with database
    - Creating new route:
    Create new file with below code in `routes` folder. Then in `app.js`, import file and add `app.use('/<endpoint_name>', <imported_file>);` 
    ```
    var express = require('express');
    var router = express.Router();

    /* GET users listing. */
    router.get('/', function(req, res, next) {
    res.send('respond with a resource');
    });

    module.exports = router;
    ```
3. app.js
    - define all the configs, import routes needed for server


### Useful tools/Documentation
[Postman](https://www.getpostman.com)
- GUI for API calls!

[Mongoose](http://mongoosejs.com)
- Simplified mongo

-[Express](https://expressjs.com/en/4x/api.html)
- Simple node server