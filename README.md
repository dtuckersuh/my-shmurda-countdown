# Bobby Shmurda Countdown

![Shmurda](https://www.nydailynews.com/resizer/0WFbReH_FPlaA9RU4I3unlEclZs=/1200x0/top/arc-anglerfish-arc2-prod-tronc.s3.amazonaws.com/public/3FJNG6SA2ZBSYFHZXACI7IKQ3E.jpg)

Web application that displays a countdown until popular rapper Bobby Shmurda's release from prison, a live stream of Tweets relating to Shmurda and his release, and a live News stream containing articles pertaining to Shmurda.

## Twitter Filtered Stream
 - Client Design
    1. Establish an HTTPS streaming connection to the filter stream endpoint
    2. Asynchronously send POST requests to the filter stream rules endpoint to add and delete rules from the stream
    3. Handle low data volumes - Maintain the streaming connection, detecting Tweet objects and keep-alive signals
    4. Handle high data volumes = de-couple stream ingestion from additional processing using asynchronous processes, and ensure client side buffers are flushed regularly
    5. Manage volume consumption tracking on the client side
    6. Detect stream disconnections, evaluate and reconnect to stream automatically

[Consuming Streaming Data](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/consuming-streaming-data)

