// Load the dotfiles.
require('dotenv').load({silent: true});

var express         = require('express');

// Middleware!
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');

var fileUpload      = require('express-fileupload');

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
var url             = require("url");
var root_path       = url.parse(process.env.ROOT_URL).pathname;
var database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

var settingsConfig  = require('./config/settings');
var adminConfig     = require('./config/admin');

var app             = express();

// Determine app's base dir
global.__basedir = __dirname;

// Connect to mongodb
mongoose.connect(database);

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(methodOverride());

app.use(root_path, express.static(__dirname + '/app/client'));

// Routers =====================================================================

var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use(root_path + '/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use(root_path + '/auth', authRouter);

require('./app/server/routes')(app);

// File upload
//app.use(fileUpload());


app.use(fileUpload({
	limits: { fileSize: 2 * 1024 * 1024 },
}));

app.post(root_path + '/upload', function(req, res) {
	console.log("We got an upload");
	console.log(req.files);
	console.log(req.body['email']);
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.resume;
 
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./uploads/resumes/'+req.body['email']+'.pdf', function(err) {
    if (err){
		console.log(err);
      return res.status(500).send(err);
	}
 
    return res.send('File uploaded!');
  });
});

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
