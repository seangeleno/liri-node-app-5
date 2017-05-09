console.log("+++++++++++++++++++++++++++");
console.log("++ initializing scripts +++");
console.log("+++++++++++++++++++++++++++");


var userInput = require("inquirer");
var request = require("request");
var keys = require("./keys.js");
var spotify = require("spotify");
var twitter = require("twitter");
var fs = require("fs");

var defaultSpot;

fs.readFile("random.txt", "utf8", function(error, data){
	if(error){
		console.log(error)
	}else{
		defaultSpot = data;	
	}
});

var twitterClient = new twitter({
	consumer_key: keys.twitterKeys.consumer_key,
	consumer_secret: keys.twitterKeys.consumer_secret,
	access_token_key: keys.twitterKeys.access_token_key,
	access_token_secret: keys.twitterKeys.access_token_secret
});

function promptCommand(){
	console.log("+++++++++++++++++++++++++++");
	userInput.prompt({
		type: "input",
		message: "Enter a command, Dave: ",
		name: "command"
	}).then(function(res){
		console.log("+++++++++++++++++++++++++++");

		command = res.command;
		if(command === "quit"){
			console.log("Daisy, daisy, give me your answer doooooo..... Script terminated");
			return;
		}else if(command ==="get my tweets"){
			getTweets();
		}else if(command ==="spotify something"){
			getSong();
		}else if(command ==="pull up OMDB"){
			getMovie();
		}else{
			console.log("I'm sorry. I can't do that Dave. (Try another command)");
		}
	});
}



//twitter timeline stuff



function getTweets(){
	userInput.prompt({
		type: "input",
		message: "how many tweets would you like me to get?",
		name: "tweetNum",
		default: "20"
	}).then(function(res){
		let tweetNum = parseInt(res.tweetNum);
		twitterClient.get("statuses/user_timeline",function(error, tweets, response){
			if(error){
				console.log(error)
			}else{
				textArray = [];
				timeArray = [];
				for(var i = 0; i < tweetNum; i++){
					textArray[i] = tweets[i].text;
					timeArray[i] = tweets[i].created_at;
					console.log("On " + timeArray[i] + " you tweeted '" + textArray[i] + "'");
					console.log("++++++++++++++++++++++++++++++++");
				}
			}
			promptCommand();
		});
	});


}

function getSong(){
	userInput.prompt({
		type: "input",
		message: "Enter a song: ",
		name: "spot",
		default: defaultSpot
	}).then(function(res){
		spotify.search({
			type: "track",
			query: res.spot,
		}, function(err, data){
			if(err){
				console.log('Errors occured: ' + err);
				return;
			}else{
				let object = data.tracks.items[0];
				let name = res.spot;
				let artistArray = [];
				for(var i = 0; i < object.artists.length; i++){
					artistArray.push(object.artists[i].name);
				}
				let artists = artistArray.join(", ") + ".";
				let album = object.album.name;
				let preview = object.preview_url;
				console.log("+++++++++++++++++++++++++++++++++++++++++");
				console.log("+++ " + name + " +++");
				console.log("+++++++++++++++++++++++++++++++++++++++++");
				console.log("+++ Artist(s): " + artists + " +++");
				console.log("+++ Album: " + album + " +++");
				if(preview){
					console.log("+++ Preview URL: " + preview + " +++");
				}else{
					console.log("+++++++ Preview Not Available ++++++++");
				}
			}
			promptCommand();
		});
	});
}

function getMovie(){
	userInput.prompt({
		type: "input",
		message: "enter a movie",
		name: "movie",
		default: "Mr. Nobody"
	}).then(function(res){
		let movie = queryFormatter(res.movie.trim());
		movieQuery = "http://www.omdbapi.com/?t=" + movie;
		request(movieQuery, function(error, response, body){
			if(error){
				console.log("error: ", error);
			}else{
				let obj = JSON.parse(body);
				console.log("+++++++++++++++++++++++++++");
				console.log("++ Movie: " + obj.Title + " ++");
				console.log("++ Year: " + obj.Year + " ++");
				console.log("++ IMDB Rating: " + obj.Ratings[0].Value + " ++");
				console.log("++ Starring: " +  obj.Actors + " ++");
				console.log("+++++++++++++++++++++++++++");
				console.log(obj.Plot);
				console.log("+++++++++++++++++++++++++++");
				console.log("++ " + obj.Country + " ++");
				console.log("++ " + obj.Language + " ++");
			}
			promptCommand();
		});
	});
}




function queryFormatter(string){
	let array = string.split("");
	for(var i = 0; i < array.length; i++){
		if(array[i] === " "){
			array[i] = "+";
		}
	}
	return array.join("");
}

promptCommand();
