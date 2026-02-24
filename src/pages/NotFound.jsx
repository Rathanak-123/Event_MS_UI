// pages/NotFound.jsx
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react"; // or any icon library

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>

        <h2 className="mt-4 text-3xl font-semibold text-gray-800 sm:text-4xl">
          Page not found
        </h2>

        <p className="mt-4 text-lg text-gray-600 max-w-md">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Optional fun element */}
        <div className="mt-16 text-gray-400 text-sm">
          The page you're looking for might have been moved, renamed, or is
          temporarily unavailable.
        </div>
      </div>
    </div>
  );
}
