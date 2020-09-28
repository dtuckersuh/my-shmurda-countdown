import React from 'react'
import { TwitterTweetEmbed } from 'react-twitter-embed'


const Tweet = ({ json, initial }) => {
    //console.log(json);
    const id = initial ? json.id : json.data.id;
    const options = {
        cards: "hidden",
        align: "center",
        width: "550",
        conversation: "none"
    }
    return <TwitterTweetEmbed options={options} tweetId={id} />
}

export default Tweet;
