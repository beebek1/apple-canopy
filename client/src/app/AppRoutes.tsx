import type { Location } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import NotFoundPage from "../shared/components/NotFound";

import Dashboard from "../modules/dashboard/DashboardPage";
import BlogList from "../modules/blogs/pages/UserBlogList";
import BlogPage from "../modules/blogs/pages/UserBlogPage";
import Orchards from "../modules/orchards/ImpactMap";
import AdminBlogList from "../modules/admin/pages/AdminBlogList";
import BlogEditor from "../modules/admin/pages/BlogEditor";

interface AppRoutesProps {
  location?: Location;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ location }) => {
  return (
    <Routes location={location}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/blogs" element={<BlogList />} />
      <Route path="/blogs/:id" element={<BlogPage />} />
      <Route path="/orchards" element={<Orchards />} />

      <Route path="/auth" element={<Dashboard />} />
      <Route path="/verify-email" element={<Dashboard />} />


      <Route element={<ProtectedRoute />}>
        <Route path="/admin/blogs" element={<AdminBlogList />} />
        <Route path="/admin/blogs/:blogId" element={<BlogEditor />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;