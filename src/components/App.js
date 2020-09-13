import React from 'react'
import TweetFeed from './TweetFeed'

class App extends React.Component {
    render() {
        return (
            <div>
                <h1>Bobby Shmurda Countdown</h1>
                <div>
                    <TweetFeed />
                </div>
            </div>
        )
    }
}

export default App
