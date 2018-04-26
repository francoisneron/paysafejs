var express = require("express");
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('json spaces', 2);

app.set('port', (process.env.PORT || 8080))

//the view, client key is passed to ejs template
app.get("/", function (req, res) {
  res.render("index.html");
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
