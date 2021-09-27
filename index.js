import tmi from "tmi.js";
import fetch from "node-fetch";

// require("dotenv").config();

import dotenv  from "dotenv";
dotenv.config();
// Define configuration options
const opts = {
	identity: {
		username: process.env.USERNAME,
		password: process.env.PASSWORD
	},
	channels: process.env.CHANNELS.split(", ")
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);

// Personal Constants
const GREETING = {
	spanish: [
		"hola", 
		"buenas",
		"buenos dias",
		"buenas tardes",
		"buenas noches"
	]
}

const url =
	"https://www.googleapis.com/youtube/v3/search?key="
	+ process.env.KEY + "&channelId="
	+ process.env.CHANNEL_ID
	+ "&part=snippet,id&order=date&maxResults=1";

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
	if (self) { return; }

	// Ignore messages from the bot
	// Remove whitespace from chat message
	const commandName = msg.trim();
	const LOWER_CASE = msg.toLowerCase();
	console.log(msg);

	// Answer Greeting
	GREETING.spanish.forEach( g => {
		const isGreeting = LOWER_CASE.startsWith(g);
		if ( isGreeting ) {
			client.say(target, `${g} ${context.username}`);
		}
	});
	
	// If the command is known, let's execute it
	if (commandName === "!dice") {
		const num = rollDice();
		client.say(target, `You rolled a ${num}`);
		console.log(`* Executed ${commandName} command`);
	} else if (commandName === "!newvid") {
		fetch(url)
			.then( response => response.json() )
			.then( data => {
				const url  =
					"https://youtu.be/"
					+ data.items[0].id.videoId;
				const title = data.items[0].snippet.title;
				client.say(target, `${title}: ${url}`);
			});
	} else {
		console.log(`* Unknown command ${commandName}`);
	}
}

// Function called when the "dice" command is issued
function rollDice () {
	const sides = 6;
	return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
}
