const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require("body-parser");
const cors = require('cors');
const exphbs = require("express-handlebars");
const io = require('socket.io').listen(server);
const mongo = require('mongodb').MongoClient;
const assert = require('assert');
const MongoDBurl = 'mongodb://localhost:27017/test';
const port = 8900;
var url = `http://localhost:${port}`;

//data models
const {video, audio} = require("./models/media");
const {projects} = require("./models/portfolio");
const {books} = require('./models/books');
const { ObjectID } = require("mongodb");

//handlebars template
app.set('view engine', 'hbs');
app.engine('hbs', exphbs(
    {
        layoutsDir: __dirname + '/views/layouts/',
        partialsDir: __dirname + '/views/partials/',
        extname: 'hbs',
        defaultLayout: 'index'
    }
));

app.use(express.static(__dirname + '/public'));

// allow all origins to access this server
app.use(cors());

//parse application/json
app.use(bodyParser.json());

//parse application/x-www-form-urlendcoded
app.use(bodyParser.urlencoded({extended: true}));

//Port listening
server.listen(port);
console.log(`Listening to port: ${port}`);
console.log(url);

//Landing page
app.get('/', (req,res) =>{
    let name = "Karen";
    let title = "HOME";
    res.render('home', {title: title, name: name, video: video, audio: audio});
});

//About page
app.get('/about', (req,res) =>{
    let title = "ABOUT";
    let name = "Karen Tsui";
    let year = 1;
    let email = "tsuik1@mail.gtc.edu";
    let frontEndSkill = ["HTML5", "CSS", "JavaScript"];
    let backEndSkill = ["PHP", "SQL", "Java", "Node.js", "MEAN stack"];
    let tools = ["Eclipse", "Netbeans", "Visual Studio Code", "Notepad++"];
    res.render('about', {title: title, name: name, year: year, email: email, frontEndSkill: frontEndSkill, backEndSkill: backEndSkill, tools: tools});
});

//Contact page
app.get('/contact', (req,res) =>{
    let title = "CONTACT";
    let name = "Karen Tsui";
    let email = "tsuik1@mail.gtc.edu";
    res.render('contact', {title: title, name: name, email: email});
});

//Portfolio page
app.get('/portfolio', (req,res) =>{
    let title = "PORTFOLIO";
    res.render('portfolio', {title: title, projects: projects});
});

//Portfolio: DragDrop page
app.get('/dragdrop', (req,res) =>{
    let title = "PORTFOLIO: DRAG AND DROP";
    let scripts = ["scripts/dragdrop.js", "https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"];
    let index = projects.findIndex(project => project.topic == "Drag and Drop");
    res.render('dragdrop', {title: title, scripts: scripts, projects: projects, index: index});
});

//Portfolio: AJAX page
app.get('/ajax', (req,res) =>{
    let title = "PORTFOLIO: AJAX";
    let scripts = ["scripts/ajax.js"];
    let index = projects.findIndex(project => project.topic == "Book Records: GET/ POST/ PUT/ DELETE");
    res.render('ajax', {title: title, scripts: scripts, projects: projects, index: index});
});

//Portfolio: AJAX page: Read all records
app.get('/ajax/api/', (req, res) => {
    res.json(books);
});

//Portfolio: AJAX page: Read a single record
app.get('/ajax/api/:id', (req, res) => {
    let id = req.params.id;

    // find the index of the element that matches the id
    let index = books.findIndex(function (book) {
        return book.id == id;
    });

    // if find then return the record at the index
    //else return an appropriate message to sender
    let record = index != -1 ? [books[index]] : "No record found.";

    res.json(record);
});

//Portfolio: AJAX page: Insert a new data
app.post('/ajax/api/', (req, res) => {
    //check for duplicate IDS before insert
    var data = req.body;
    let message = "Invalid insert: duplicate IDS.";

    let index = books.findIndex(book => book.id == data.id);
    //if ID does not exist, push data to the list
    //else error message
    if (index == -1) { //id not found, add data
        var data = req.body;
        books.push(data);
        message = "Successfully added!";
    }
    res.json(message);
});

//Portfolio: AJAX page: Update an existing record
app.put('/ajax/api/:id', (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let message = "No record updated";

    // find the index of the element that matches the id
    // if a match is found, return the index position
    // else return a -1 (not found)
    let index = books.findIndex(book => book.id == id);
    if (index != -1) { // id found
            books[index] = data;
            message = "Record updated";
    } 
    res.json(message);
});

//Portfolio: AJAX page: Delete a single record
app.delete('/ajax/api/:id', (req, res) => {
    let id = req.params.id;
    let message = 'Sorry, no record found.';

    // find the index of the element that matches the id
    // if a match is found, return the index position
    // else return a -1 (not found)
    let index = books.findIndex(book => book.id == id);
    if (index != -1) {
        books.splice(index, 1);
        message = "Record deleted.";
    }
    res.json(message);
});

//Portfolio: AJAX page: Delete all records
app.delete("/ajax/api/", (req, res) => {
    books.splice(0);
    res.json("All records deleted.");
});

//Portfolio: Chat page
app.get('/chat', (req,res) =>{
    let title = "PORTFOLIO: CHAT";
    let scripts = ["scripts/chat.js", "scripts/socket.io.js"];
    let index = projects.findIndex(project => project.topic == "Live Chat Room");
    res.render('chat', {title: title, scripts: scripts, projects: projects, index: index});

    // Websocket for Chat page
    var usernames = {};
    var count = Math.floor(Math.random() * 1000);

    io.sockets.on('connection', function (socket) {
        socket.on('sendchat', function (data) {
            io.sockets.emit('updatechat', socket.username, data);
        });

        socket.on('adduser', function(username){
            // generate random name without empy input
            if (username == "" || username == null) { 
                username = "user" + (count +"");
            };

            socket.username = username;
            usernames[username] = username;
            socket.emit('updatechat', 'SERVER', 'you have connected');
            socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
            io.sockets.emit('updateusers', usernames);
 
        });

        socket.on('disconnect', function(){
            delete usernames[socket.username];
            io.sockets.emit('updateusers', usernames);
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        });
    });
});

//CRUD Operation REST API
//Conntect to Mongo
mongo.connect(MongoDBurl, function(err, db) {
    assert.equal(null, err);
    console.log('Connected to MongoDB.');
    db.close();
});
// MongoDB GET
app.get('/api/users', function(req, res) { 
    mongo.connect(MongoDBurl,{ useNewUrlParser: true }, function(err, database) {
        const db = database.db('test');
        db.collection('users').find().toArray(function(err, result) { 
            if (err) { 
                throw err; 
            } 
            console.log(result.length + ' documents retrieved.'); 
            //res.json(result); 
            console.log(result);

            let title = "PORTFOLIO: CRUD";
            res.render('users', { title: title, projects: projects, data:result})
            database.close(); 
        }); 
    }); 
});
 // MongoDB Post
app.post('/api/users', function(request, response) {
    console.dir(request.body);
    mongo.connect(MongoDBurl,{ useNewUrlParser: true }, function(err, database) {
        const db = database.db('test');
        db.collection('users').insertOne(request.body, function(err, result) {
            if (err) {
              throw err;
            }
            console.log('Document inserted successfully.');
           // response.json(result);
            response.redirect(url + "/api/users");
            database.close();
        });
    });
});
// MongoDB PUT
app.put('/api/users', function(request, response) {
    console.dir(request.body);
    mongo.connect(MongoDBurl,{ useNewUrlParser: true }, function(err, database) {
        const db = database.db('test');
        var query = { first_name: 'Karen' };
        var firstName = 'Karen',
            lastName = request.body.last_name,
            title = request.body.title,
            website = request.body.website;
        var newValue = {$set: {first_name: firstName, last_name: lastName, title: title, website: website} }; 
        db.collection('users').updateOne(query, newValue, function(err, result) {
            if (err) {
              throw err;
            }
            console.log('Document updated successfully.');
            //response.json(result);
            response.redirect(url + "/api/users");
            database.close();
        });
    });
});

// MongoDB DELETE
app.delete('/api/users', function(request, response) {
    console.dir(request.body);
    mongo.connect(MongoDBurl,{ useNewUrlParser: true }, function(err, database) {
        const db = database.db('test');
        var lastName = request.body.last_name;
        var query = { last_name: lastName };
        db.collection('users').deleteOne(query, function(err, result) {
            if (err) {
              throw err;
            }
            console.log('Document deleted successfully.');
            //response.json(result);
            response.redirect(url + "/api/users");
            database.close();
        });
    });
});
//catch all - must be at the bottom of all GET methods
app.get('*', (req, res) =>{
    res.render('notfound');
});
