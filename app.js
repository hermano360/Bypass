var express = require('express');
var app = express();
var port = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.status(200).render('esri_testing');
});


app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + '/public'));

app.listen(port);
console.log("Listening to port", port);


