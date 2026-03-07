import { Routes, Route } from "react-router-dom";
import AdminRouter from "./adminRoute";
import ClientRouter from "./clientRoute";

export default function Router(props) {
  return (
    <Routes>
      {/* Route for Client Portal at / */}
      <Route path="/" element={<ClientRouter />} />

      {/* Admin and other routes handled by AdminRouter */}
      <Route path="/*" element={<AdminRouter {...props} />} />
    </Routes>
  );
}
