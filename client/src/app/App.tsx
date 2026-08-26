import { BrowserRouter } from 'react-router-dom'
import Navbar from '../shared/components/Navbar'
import '../styles/App.css'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from '../shared/components/ScrollToTop'
import AppRoutes from './AppRoutes'
import Footer from '../shared/components/Footer'
import Auth from "../modules/admin/Auth";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar/>
      <ScrollToTop />
      <Toaster position="top-right" />
      <div>
        <AppRoutes/>
      </div>
      <Footer/>
      <Auth/>
    </BrowserRouter>
  );
};
export default App
