import React from 'react';

import LoginForm from '../../../components/LoginForm/LoginForm';

const Login = () => {
  return <LoginForm onSubmit={() => undefined} onChange={() => undefined} errors={{}} values={{ email: '', password: '' }} submitting={false} />;
};

export default Login;
