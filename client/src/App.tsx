import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import DBDisplay from './pages/DBDisplay';
import Shared from './pages/Shared';
import './styles/index.css';

const App: React.FC = () => {

  /*
    React Router, a library for Client-Side Rendering, with 4 different paths:
    1. "/" - main launch page
    2. "/signup" - sign up page
    3. "/login" - login page
    4. "/display" | "/display/" - database visualization application page; only accessible when user is authorized;
    ** Reroutes either to home or display if signed in depending on 
  */

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shared />}>
          {/* index renders root directory */}
          <Route index element={<DBDisplay />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
