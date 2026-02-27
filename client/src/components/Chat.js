import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import axios from 'axios';

const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #0f0f0f;
`;

const Sidebar = styled.div`
  width: 350px;
  background: #1a1a1a;
  border-left: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #fff;
`;

const UserStatus = styled.div`
  font-size: 12px;
  color: #4caf50;
`;

const SearchBox = styled.div`
  padding: 15px;
  background: #1a1a1a;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 25px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    background: #333;
  }
`;

const UsersList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 3px;
  }
`;

const UserItem = styled.div`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #2a2a2a;
  
  &:hover {
    background: #252525;
  }
  
  ${props => props.active && `
    background: #2a2a2a;
  `}
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.online ? '#4caf50' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: ${props => props.online ? '#4caf50' : '#888'};
    border: 2px solid #1a1a1a;
    border-radius: 50%;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Time = styled.div`
  font-size: 12px;
  color: #888;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
`;

const ChatHeader = styled.div`
  padding: 15px 25px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const ChatName = styled.div`
  font-weight: 600;
  color: #fff;
  font-size: 16px;
`;

const ChatStatus = styled.div`
  font-size: 13px;
  color: #888;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.sent ? 'flex-start' : 'flex-end'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.sent ? '#2b5278' : '#2a2a2a'};
  color: #fff;
  position: relative;
  word-wrap: break-word;
  
  ${props => props.sent ? `
    border-bottom-right-radius: 4px;
  ` : `
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${props => props.sent ? '#8ab4f8' : '#888'};
  margin-top: 5px;
  text-align: ${props => props.sent ? 'left' : 'right'};
`;

const InputArea = styled.div`
  padding: 20px;
  background: #1a1a1a;
  border-top: 1px solid #2a2a2a;
  display: flex;
  gap: 15px;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  background: #2a2a2a;
  color: #fff;
  font-size: 15px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    background: #333;
  }
`;

const SendButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #667eea;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  
  &:hover {
    background: #5568d3;
    transform: scale(1.05);
  }
  
  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  
  h2 {
    margin-bottom: 10px;
    color: #888;
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #c82333;
  }
`;

function Chat({ user, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.emit('join', user.username);

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('user_status', ({ username, status }) => {
      setUsers(prev => prev.map(u => 
        u.username === username ? { ...u, status } : u
      ));
      if (status === 'online') {
        setOnlineUsers(prev => [...new Set([...prev, username])]);
      } else {
        setOnlineUsers(prev => prev.filter(u => u !== username));
      }
    });

    newSocket.on('new_message', (message) => {
      if (selectedUser && 
          (message.sender === selectedUser.username || message.receiver === selectedUser.username)) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('typing', ({ sender }) => {
      if (selectedUser && sender === selectedUser.username) {
        setTyping(true);
        setTimeout(() => setTyping(false), 3000);
      }
    });

    // Load users
    axios.get(`${API_URL}/api/users`)
      .then(res => setUsers(res.data));

    return () => newSocket.close();
  }, [user.username, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`${API_URL}/api/messages/${user.username}/${selectedUser.username}`)
        .then(res => setMessages(res.data));
    }
  }, [selectedUser, user.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    socket.emit('send_message', {
      receiver: selectedUser.username,
      content: newMessage,
      type: 'text'
    });

    setNewMessage('');
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', { receiver: selectedUser.username });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedUser) {
    return (
      <ChatContainer>
        <Sidebar>
          <SidebarHeader>
            <UserAvatar>{user.username[0].toUpperCase()}</UserAvatar>
            <UserInfo>
              <UserName>{user.username}</UserName>
              <UserStatus>متصل الآن</UserStatus>
            </UserInfo>
            <LogoutButton onClick={onLogout}>خروج</LogoutButton>
          </SidebarHeader>
          <SearchBox>
            <SearchInput placeholder="بحث..." />
          </SearchBox>
          <UsersList>
            {users.filter(u => u.username !== user.username).map(u => (
              <UserItem key={u.username} onClick={() => setSelectedUser(u)}>
                <Avatar online={onlineUsers.includes(u.username)}>
                  {u.username[0].toUpperCase()}
                </Avatar>
                <UserDetails>
                  <Name>{u.username}</Name>
                  <LastMessage>{u.status === 'online' ? 'متصل الآن' : 'غير متصل'}</LastMessage>
                </UserDetails>
              </UserItem>
            ))}
          </UsersList>
        </Sidebar>
        <EmptyState>
          <h2>اختر محادثة للبدء</h2>
          <p>اختر مستخدم من القائمة لبدء المحادثة</p>
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <Sidebar>
        <SidebarHeader>
          <UserAvatar>{user.username[0].toUpperCase()}</UserAvatar>
          <UserInfo>
            <UserName>{user.username}</UserName>
            <UserStatus>متصل الآن</UserStatus>
          </UserInfo>
          <LogoutButton onClick={onLogout}>خروج</LogoutButton>
        </SidebarHeader>
        <SearchBox>
          <SearchInput placeholder="بحث..." />
        </SearchBox>
        <UsersList>
          {users.filter(u => u.username !== user.username).map(u => (
            <UserItem 
              key={u.username} 
              active={selectedUser?.username === u.username}
              onClick={() => setSelectedUser(u)}
            >
              <Avatar online={onlineUsers.includes(u.username)}>
                {u.username[0].toUpperCase()}
              </Avatar>
              <UserDetails>
                <Name>{u.username}</Name>
                <LastMessage>{u.status === 'online' ? 'متصل الآن' : 'غير متصل'}</LastMessage>
              </UserDetails>
            </UserItem>
          ))}
        </UsersList>
      </Sidebar>

      <ChatArea>
        <ChatHeader>
          <Avatar online={onlineUsers.includes(selectedUser.username)}>
            {selectedUser.username[0].toUpperCase()}
          </Avatar>
          <ChatInfo>
            <ChatName>{selectedUser.username}</ChatName>
            <ChatStatus>
              {typing ? 'يكتب الآن...' : 
               (onlineUsers.includes(selectedUser.username) ? 'متصل الآن' : 'غير متصل')}
            </ChatStatus>
          </ChatInfo>
        </ChatHeader>

        <MessagesContainer>
          {messages.map((msg, idx) => (
            <MessageGroup key={idx} sent={msg.sender === user.username}>
              <MessageBubble sent={msg.sender === user.username}>
                {msg.content}
                <MessageTime sent={msg.sender === user.username}>
                  {formatTime(msg.timestamp)}
                </MessageTime>
              </MessageBubble>
            </MessageGroup>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputArea>
          <MessageInput
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            placeholder="اكتب رسالة..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
          />
          <SendButton onClick={sendMessage} disabled={!newMessage.trim()}>
            ➤
          </SendButton>
        </InputArea>
      </ChatArea>
    </ChatContainer>
  );
}

export default Chat;
