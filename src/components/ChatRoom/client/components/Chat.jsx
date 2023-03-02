import { useEffect, useState } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import './Chat.scss';

function Chat({ socket, username, room }) {
    const [currentMessage, setCurrentMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [hideChat, setHideChat] = useState(true);
    const sendMessage = async () => {
        if (currentMessage !== '') {
            const messageData = {
                room: room,
                author: username,
                message: currentMessage,
                time: (new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes()).padStart(2, '0')
            };

            await socket.emit('send_message', messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage('');
        }
    }
    useEffect(() => {
        socket.on('receive_message', data => {
            setMessageList((list) => [...list, data]);
        })  
        return () => socket.removeListener('receive_message')
    }, [socket]);
  return (
    <div className={hideChat ? 'chat-window' : 'hide-chat-window' }>

        {hideChat ?
        <>
        <div className='chat-body'>
            <ScrollToBottom className='message-container'>
                {messageList?.map((messageContent) => {
                    return (
                        <div key={messageContent.time} className='message' id={username === messageContent.author ? 'other' : 'you'}>
                            <div>
                                <div className='message-content'>
                                    <div><p>{messageContent.message}</p></div>
                                </div>
                                <div className='message-meta'>
                                    <p id="author">{messageContent.author}</p>
                                    <p id="time">{messageContent.time}</p>
                                </div>
                            </div>
                        </div>
                        )
                })}       
                {!messageList.length && <div className='start-conversation'>Start conversation</div>}
            </ScrollToBottom>
            
        </div>
        <div className='chat-footer'>
            <input 
                type='text'
                value={currentMessage}
                placeholder='Hey...'
                onKeyPress={(e) => {e.key === 'Enter' && sendMessage()}}
                onChange={(e) => {
                    setCurrentMessage(e.target.value)
                }}
            />
            <button onClick={sendMessage}>&#9658;</button>
        </div>
        </>
        : null }
        <div className='live-chat-window' onClick={() => setHideChat(!hideChat)}>
            <h3>{hideChat ? 'Hide' : 'Show'} Live Chat</h3>
        </div>
    </div>
  )
}

export default Chat