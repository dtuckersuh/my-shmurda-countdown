import React, { useEffect, useReducer } from 'react';
import socketIOClient from "socket.io-client";

import Tweet from './Tweet';
import ErrorMessage from './ErrorMessage';

const reducer = (state, action) => {
    switch (action.type) {
        case "initialize":
            return {
                ...state,
                initial: [action.payload, ...state.initial],
                tweets: [],
                error: null,
                isWaiting: false,
                errors: [],
            }
        case "add_tweet":
            return {
                ...state,
                tweets: [action.payload, ...state.tweets],
                error: null,
                isWaiting: false,
                errors: [],
            }
        case "show_error":
            return { ...state, error: action.payload, isWaiting: false }
        case "add_errors":
            return { ...state, errors: action.payload, isWaiting: false }
        case "update_waiting":
            return { ...state, error: null, isWaiting: true }
        default:
            return state
    }
}

const TweetFeed = () => {
    const initialState = {
        initial: [],
        tweets: [],
        error: {},
        isWaiting: true,
    }

    const [state, dispatch] = useReducer(reducer, initialState)
    const { initial, tweets, error, isWaiting } = state

    const initializeTweets = () => {
        let socket;
        if (process.env.NODE_ENV === "development") {
                socket = socketIOClient("http://localhost:3001/")
        } else {
            socket = socketIOClient("/")
        }
        // Initial 10 tweets on startup
        socket.on("search", (json) => {
                //console.log('search socket reached');
                //console.log(json);
                if (json.data) {
                    //console.log(json.data);
                    json.data.forEach(tweet => {
                        console.log(tweet, "Tweety bird");
                        dispatch({ type: "initialize", payload: tweet });
                    })
                }
        })
    }
    
    const streamTweets = () => {
        let socket;

        if (process.env.NODE_ENV === "development") {
            socket = socketIOClient("http://localhost:3001/")
        } else {
            socket = socketIOClient("/")
        }

        socket.on("connect", () => {})
        
        socket.on("tweet", (json) => {
            if (json.data) {
                dispatch({ type: "add_tweet", payload: json })
            }
        })
        socket.on("heartbeat", (data) => {
            dispatch({ type: "update_waiting" })
        })
        socket.on("error", (data) => {
            dispatch({ type: "show_error", payload: data })
        })
        socket.on("authError", (data) => {
            dispatch({ type: "add_errors", payload: [data] })
        })
    }

    const reconnectMessage = () => {
        const message = {
            title: "Reconnecting",
            detail: "Please wait while we reconnect to the stream.",
        }

        if (error && error.detail) {
            return (
                <div>
                    <ErrorMessage key={error.title} error={error} styleType="warning" />
                    <ErrorMessage key={message.title} error={message} styleType="success" />
                </div>
            )
        }
    }

    const errorMessage = () => {
        const { errors } = state
        if (errors && errors.length > 0){
            return errors.map((error) => (
                <ErrorMessage key={error.title} error={error} styleType="negative" />
            )); 
        }
    };

    const waitingMessage = () => {
        const message = {
            title: "Still working",
            detail: "Waiting for new Tweets to be posted",
        }
        
        if (isWaiting) {
            return (
                <React.Fragment>
                    <div>
                        <ErrorMessage
                            key={message.title}
                            error={message}
                            styleType="success"
                        />
                    </div>
                </React.Fragment>
            ) 
        }
    }

    useEffect(() => {
        streamTweets()
    }, [])

    const showInitial = () => {
        return (
            <React.Fragment>
                {console.log(initial, "Its ame Mario")}
                {initial.map((tweet) => (
                    <Tweet key={tweet.id} json={tweet} initial={true} />
                ))}
            </React.Fragment>
        )
    }
    const showTweets = () => {
        //initializeTweets();
        if (tweets.length > 0) {
            return (
                <React.Fragment>
                    {tweets.map((tweet) => (
                        <Tweet key={tweet.data.id} json={tweet} initial={false}/>
                    ))}
               </React.Fragment>
            );
        }
    }

    return (
        <div>
            {showInitial()}
            {reconnectMessage()}
            {errorMessage()}
            {waitingMessage()}
            {showTweets()}
        </div>
    )
}

export default TweetFeed;
