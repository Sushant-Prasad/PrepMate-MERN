// src/pages/Login.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ref to hold redirect timer so we can clear on unmount
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/users/login`,
        { email, password },
        { withCredentials: true }
      );

      const user = data?.user ?? data;

      // persist non-sensitive user info
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (err) {
        console.warn("Could not persist user to localStorage", err);
      }

      // notify parent
      if (typeof onLogin === "function") onLogin(user);

      // decide destination and friendly message
      const isAdmin =
        user?.isAdmin === true ||
        (typeof user?.role === "string" && user.role.toLowerCase() === "admin");

      let message;
      let targetPath;
      if (from) {
        message = "Login successful! Redirecting to your previous page…";
        targetPath = from;
      } else if (isAdmin) {
        message = "Login successful! Redirecting to admin dashboard...";
        targetPath = "/admin/dashboard";
      } else {
        message = "Login successful! Redirecting to homepage...";
        targetPath = "/";
      }

      setSuccessMessage(message);

      // short delay so user can read the message
      redirectTimerRef.current = setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-gray-800">
              Login
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {/* success message banner */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-4 rounded-md bg-green-50 border border-green-100 text-green-800 px-4 py-2 text-sm font-medium"
                role="status"
                aria-live="polite"
              >
                {successMessage}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 font-medium">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full rounded-lg"
                disabled={loading}
              >
                {loading ? "Logging in…" : "Login"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-indigo-600 hover:underline"
              >
                Register
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
