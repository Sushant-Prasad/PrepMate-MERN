import { AlertCircle, Home, RefreshCw } from "lucide-react";

const Error = ({ error, reset }) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{
        background: "linear-gradient(135deg, #E8F9FD, #CAF0F8)"
      }}
    >
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-[#3DBFD933]">

        {/* Icon Section */}
        <div className="flex justify-center mb-6">
          <div 
            className="rounded-full p-5 shadow-md"
            style={{ backgroundColor: "#3DBFD922" }}
          >
            <AlertCircle className="w-12 h-12" style={{ color: "#03045E" }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-2"
            style={{ color: "var(--brand-secondary)" }}>
          Oops! Something went wrong
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {error?.message || "We encountered an unexpected error. Please try again."}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">

          {/* Retry Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-[1.03]"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "#fff"
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          {/* Home Button */}
          <button
            onClick={() => (window.location.href = "/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-[1.03]"
            style={{
              backgroundColor: "#E0E5F9",
              color: "var(--brand-secondary)"
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Error Digest */}
        {error?.digest && (
          <p className="text-xs text-gray-400 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
};

export default Error;
