const express = require("express")
const request = require("request")
const socketIo = require("socket.io")
const http = require("http")
const util = require("util")
const path = require("path")
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express()
let port = process.env.PORT || 3000
const post = util.promisify(request.post);
const get = util.promisify(request.get);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app)
const io = socketIo(server)

const BEARER_TOKEN = process.env.REACT_APP_TWITTER_BEARER_TOKEN
let timeout = 0

// Filtered stream and rules endpoints
const streamURL = new URL("https://api.twitter.com/2/tweets/search/stream")
const rulesURL = new URL("https://api.twitter.com/2/tweets/search/stream/rules")
const searchURL = new URL("https://api.twitter.com/2/tweets/search/recent");

const authMessage = {
    title: "Could not authenticate",
    details: [
        `Please make sure bearer token is correct.`,
    ],
    type: "https://developer.twitter.com/en/docs/authentication"
}

const errorMessage = {
    title: "Please Wait",
    detail: "Waiting for new Tweets to be posted...",
};

const sleep = async (delay) => {
    return new Promise((resolve) => setTimeout(() => resolve(true), delay))
}

app.get("/api/rules", async (req, res) => {
    if (!BEARER_TOKEN) {
        res.status(400).send(authMessage)
    }

    const token = BEARER_TOKEN
    const requestConfig = {
        url: rulesURL,
        auth: {
            bearer: token,
        },
        json: true,
    }

    try {
        const response = await get(requestConfig)
        if (response.statusCode !== 200) {
            if (response.statusCode === 403) {
                res.status(403).send(response.body)
            } else {
                throw new Error(response.body.error.message)
            }
        }
        console.log(response);
        res.send(response)
    } catch (e) {
        res.send(e)
    }
})


app.post("api/rules", async (req, res) => {
    if (!BEARER_TOKEN) {
        res.status(400).send(authMessage);
    }
    
    const token = BEARER_TOKEN
    const payload = { add: [{ value: "Bobby Shmurda OR #BobbyShmurda OR #FreeShmurda -#NowPlaying"}]};
    const requestConfig = {
        url: rulesURL,
        auth: {
            bearer: token,
        },
        json: payload,
    }

    try {
        const response = await post(requestConfig)

        if (response.statusCode === 200 || response.statusCode === 201) {
            res.send(response)
        } else {
            throw new Error(response)
        }
    } catch (e) {
        res.send(e)
    }
})

//const payload = { 'query': "Bobby Shmurda OR #BobbyShmurda OR #FreeShmurda -#NowPlaying",
//                        'max_results': '10'};

// Initial search of 10 filtered tweets
app.get("api/search", async (req, res) => {
    if (!BEARER_TOKEN) {
        res.status(400).send(authMessage);
    }

    const token = BEARER_TOKEN;
    const requestConfig = {
        url: 'https://api.twitter.com/2/tweets/search/recent?query=Bobby Shmurda OR %23BobbyShmurda OR %23FreeShmurda -%23NowPlaying&max_results=10',
        auth: {
            bearer: token,
        },
    }

    try {
        const response = await get(requestConfig);
        //console.log(response);
        if (response.statusCode === 200 || response.statusCode === 201) {
            res.send(response);
        } else {
            throw new Error(response);
        }
    } catch (e) {
        res.send(e);
    }
});

const initialTweets = (socket, token) => {
    //const config = {
    //    url: searchURL,
    //    auth: {
    //        bearer: token,
    //    },
    //    json: payload,
    //}
    let config = {
      'url': 'https://api.twitter.com/2/tweets/search/recent?query=Bobby Shmurda OR %23BobbyShmurda OR %23FreeShmurda -%23NowPlaying&max_results=10',
      'headers': {
        'Authorization': 'Bearer ', token,
        'Cookie': 'personalization_id="v1_btHYm+zSlDj7Hzg8e8RFmQ=="; guest_id=v1%3A159926825574158480'
      }
    };
    try {
        const json = request.get(config);
        console.log(json);
        console.log('initial tweets function reached');
        if (json.connection_issue) {
            console.log('json connection issue');
            socket.emit("error", json);
        } else {
            if (json.data) {
                socket.emit("search", json);
            } else {
                console.log('incorrect/no json.data')
                socket.emit("error", errorMessage);
            }
        }
    } catch (e) {
        console.log('error catch');
        socket.emit("error", errorMessage);
    }
    //request(options, function (error, response, socket) {
    //  if (error) throw new Error(error);
    //  socket.emit("search", response);
    //});
    
}

const streamTweets = (socket, token) => {
    //let stream;
    const config = {
        url: streamURL,
        auth: {
            bearer: token,
        },
        timeout: 31000,
    }
    try {
        const stream = request.get(config)
        //console.log(stream);
        initialTweets(socket, token);
        stream
            .on("data", (data) => {
                try {
                    const json = JSON.parse(data)
                    //console.log(json);
                    if (json.connection_issue) {
                        socket.emit("error", json)
                        reconnect(stream, socket, token)
                    } else {
                        if (json.data) {
                            socket.emit("tweet", json)
                        } else {
                            socket.emit("authError", json)
                        }
                    }
                } catch (e) {
                    socket.emit("heartbeat")    // Waiting for update
                }
            })
            .on("error", (error) => {
                // Connection timed out
                socket.emit("error", errorMessage)
                reconnect(stream, socket, token)
            })
    } catch (e) {
        socket.emit("authError", authMessage)
    }
}

const reconnect = async (stream, socket, token) => {
    timeout++
    stream.abort()
    await sleep(2 ** timeout * 1000)
    streamTweets(socket, token)
}

io.on("connection", async (socket) => {
    try {
        const token = BEARER_TOKEN;
        io.emit("connect", "Client Connected");
        streamTweets(io, token);
    } catch (e) {
        io.emit("authError", authMessage);
    }
})

console.log("NODE_ENV is", process.env.NODE_ENV)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../build")))
    app.get("*", (request, res) => {
        res.sendFile(path.join(__dirname, "../build", "index.html"))
    })
} else {
    port = 3001
}

server.listen(port, () => console.log(`Listening on port ${port}`))