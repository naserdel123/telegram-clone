import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  margin-bottom: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, background 0.3s;
  
  &:hover {
    background: #5568d3;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #667eea;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 8px;
`;

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password
      });

      if (isLogin) {
        onLogin({
          username: response.data.username,
          token: response.data.token,
          avatar: response.data.avatar
        });
      } else {
        setIsLogin(true);
        setError('تم إنشاء الحساب بنجاح! سجل دخولك الآن');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'جاري التحميل...' : (isLogin ? 'دخول' : 'إنشاء')}
          </Button>
        </form>
        
        <ToggleText onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
        </ToggleText>
      </LoginBox>
    </LoginContainer>
  );
}

export default Login;
