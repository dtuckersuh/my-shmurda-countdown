# Program Design and Notes

## TODO:
- [x] Apply streaming app tutorial to application
- [ ] Fix SameSite cookie issue
- [ ] Make site pretty (semantic-ui?)
- [ ] Figure out how to cache previous tweets so user doesn't open empty page
- [ ] Make countdown clock from Shmurda's parole date
- [ ] Add newsfeed

## Stream Tweets in Real Time
- Plan and prepare to process the needed data
    - Filtered stream endpoints
    - Rules apply filtering criteria
        - "from:" matches any Tweet from a specific user
        - "has:links" matches Tweets containing links in the Tweet body
- Connect and Authenticate to the appropriate endpoint

## Filtered Stream
- Client Design

1. Establish an HTTPS streaming connection to the filter stream endpoint
2. Asynchronously send POST requests to the filter stream rules endpoint to add and delete rules from the stream
3. Handle low data volumes - Maintain the streaming connection, detecting Tweet objects and keep-alive signals
4. Handle high data volumes = de-couple stream ingestion from additional processing using asynchronous processes, and ensure client side
    buffers are flushed regularly
5. Manage volume consumption tracking on the client side
6. Detect stream disconnections, evaluate and reconnect to stream automatically

## Twitter API v2 Notes
- Rate Limits
    - Recovering from a rate limit 429 error
        - A 429 is a 'too many requests' error
        - Best practice is to examine HTTP headers that indicate when limit resets and pause requests until then
        - Another common pattern is exponential backoff, where time between requests start small then doubles each retry until request is successful
        - Ideally, client-side pauses requests until currently exceeded windows expires
    - Tips to avoid being rate limited
        - Caching
            - Store API responses in application and load cached version of results
- Fundamentals/Data Dictionary
    - Top-level resource such as Tweets in recent search and filtered stream have relevant additional objects in the same payload with expansions
    - To retrieve a complete Tweet, use a combination of fields and expansions query parameters
- Fundamentals/Metrics
    - The metrics field allows for the access of public metrics such as likes, retweets, and impressions (views)
- Tweets/Lookup
    - GET method to return information about a Tweet or group of Tweets, specified by a Tweet ID
    - Returns one or many Tweet objects, with fields such as the Tweet text, author, media attachments, and more
- Tweets/Recent Search
    - Returns Tweets from the last 7 days that match a search query
- Tweets/Filtered Stream
    - Allows user to listen for specific topics and events in real-time
    - Filter queries can be created with operators that match Tweet attributs, such as message keyword
    - Tweet objects delivered in JSON format through a persisten HTTP Streaming connection

## Tutorials

### Building an app to stream Tweets in real-time Tutorial
- https://developer.twitter.com/en/docs/tutorials/building-an-app-to-stream-tweets

### React/Node.js Twitter Stream Tutorial
- https://scotch.io/tutorials/build-a-real-time-twitter-stream-with-node-and-react-js

## Deployment
- AWS S3
- Github Pages
