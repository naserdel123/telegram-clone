import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Login from './components/Login';
import Chat from './components/Chat';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Cairo', sans-serif;
    background: #1a1a1a;
    color: #fff;
  }
`;

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {user ? (
          <Chat user={user} onLogout={() => setUser(null)} />
        ) : (
          <Login onLogin={setUser} />
        )}
      </AppContainer>
    </>
  );
}

export default App;
