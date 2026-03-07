import { Routes, Route } from "react-router-dom";
import ClientLayout from "../layouts/ClientLayout";

export default function ClientRouter() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route
          path="/"
          element={
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h1>Client Home Page</h1>
              <p>This is the test route for client.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
