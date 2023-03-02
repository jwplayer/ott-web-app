import { useState } from 'react';
import * as io from 'socket.io-client';

import Chat from './components/Chat';
import './App.scss';

const socket = io.connect("http://localhost:3000");

function App({user}) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [hideChat, setHideChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  }

  return (
    <div className="joinChat" id="chatRoom">
    {showChat 
      ? <Chat socket={socket} username={username} room={room} />
      : (
          <div className="joinChatContainer">
            {hideChat ? (
              <>
                <input type="text" placeholder='Your Name' onChange={(e) => setUsername(e.target.value)} />
                <input type="text" placeholder='Room ID' onChange={(e) => setRoom(e.target.value)} />
                <button className='joinRoomButton' onClick={joinRoom}>Join A Room</button>
              </>
            ) : <div className="joinChatButton" onClick={() => setHideChat(!hideChat)}>Join a Chat</div>}
          </div>
        )
    }
    </div>
    )
}

export default App;