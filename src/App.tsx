import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScreenPage from './pages/ScreenPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/screen" element={<ScreenPage />} />
    </Routes>
  );
};

export default App;
