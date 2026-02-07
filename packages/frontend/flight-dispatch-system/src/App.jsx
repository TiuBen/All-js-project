import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Detail from './pages/Detail';
import { FlightProvider } from './context/FlightContext'; 

function App() {
  return (
    <FlightProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/detail/:flightNumber' element={<Detail/>} />
        </Routes>
      </BrowserRouter>
    </FlightProvider>
  );
}

export default App
