import { Routes, Route } from "react-router-dom";
import AdminRouter from "./adminRoute";
import ClientRouter from "./ClientRoute";

export default function Router(props) {
  return (
    <Routes>
      {/* Admin and other routes handled by AdminRouter */}
      <Route path="/admin/*" element={<AdminRouter {...props} />} />

      {/* Route for Client Portal at / */}
      <Route path="/*" element={<ClientRouter />} />

    </Routes>
  );
}
