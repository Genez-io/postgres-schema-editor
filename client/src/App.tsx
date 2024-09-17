import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import DBDisplay from './pages/DBDisplay';
import Shared from './pages/Shared';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shared />}>
          {/* index renders root directory */}
          <Route path="/edit/:dbId" element={<DBDisplay />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
