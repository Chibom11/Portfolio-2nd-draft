import LandingPage from '../components/LandingPage.jsx'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import CharacterSelect from '../components/CharacterSelect.jsx'
import './App.css'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CharacterSelect/>}/>
        <Route path='/portfolio' element={<LandingPage/>}>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
