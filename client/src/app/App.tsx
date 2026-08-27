import { BrowserRouter, useLocation } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import Navbar from '../shared/components/Navbar'
import '../styles/App.css'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from '../shared/components/ScrollToTop'
import AppRoutes from './AppRoutes'
import Footer from '../shared/components/Footer'
import Auth from "../modules/admin/pages/Auth";
import VerifyEmail from "../modules/admin/pages/VerifyEmail";

// This has to live *inside* <BrowserRouter> so it can read useLocation().
function AppShell() {
  const location = useLocation();

  // When something navigates to /auth via:
  //   navigate("/auth", { state: { backgroundLocation: location } })
  // this pulls that stashed location back out, so we know what page
  // was actually open behind the modal.
  const backgroundLocation = (location.state as { backgroundLocation?: Location } | null)
    ?.backgroundLocation;

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Toaster position="top-right" />
      <div>
        {/* Render the real page routes against the background location
            (if we have one) instead of /auth, so the page underneath the
            modal stays whatever it was — never a 404. */}
        <AppRoutes location={backgroundLocation ?? location} />
      </div>
      <Footer />
      <Auth />
      <VerifyEmail />
    </>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
};
export default App