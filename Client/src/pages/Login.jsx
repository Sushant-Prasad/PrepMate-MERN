import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#03c6f7c9] via-[#F5FCFF] to-[#7859dd] overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ background: "var(--brand-primary)" }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          style={{ background: "var(--brand-secondary)" }}
          animate={{
            x: [100, -100, 100],
            y: [100, 0, 100],
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2, ease: "easeInOut" }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border border-white/40 backdrop-blur-sm bg-white/95 rounded-3xl overflow-hidden">
          {/* Gradient header accent */}
          <div className="h-1 bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-primary)] to-[#6EDBF0]" />

          <CardHeader className="pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex p-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))" }}
                >
                  <Lock className="w-6 h-6 text-white" />
                </motion.div>
              </div>
              <CardTitle className="text-3xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)" }}>
                Welcome Back
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2 font-medium">Sign in to your account to continue</p>
            </motion.div>
          </CardHeader>

          <Separator className="bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-30" />

          <CardContent className="pt-6">
            {/* success message banner */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 px-4 py-3 flex items-start gap-3"
                role="status"
                aria-live="polite"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-semibold">{successMessage}</p>
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 rounded-lg border-2 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_20%,white)] transition-all duration-200 placeholder-gray-400"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-2 block">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 rounded-lg border-2 border-gray-200 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_20%,white)] transition-all duration-200 placeholder-gray-400"
                  />
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 px-4 py-3 flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg font-semibold text-white transition-all duration-200 relative overflow-hidden group"
                  style={{
                    background: loading ? "var(--brand-primary)" : "linear-gradient(135deg, var(--brand-secondary), var(--brand-primary))",
                  }}
                >
                  <motion.div
                    whileHover={!loading ? { scale: 1.05 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex items-center justify-center gap-2 w-full"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </Button>
              </motion.div>
            </form>

            <Separator className="my-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <motion.button
                  type="button"
                  onClick={() => navigate("/register")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] hover:opacity-75 transition-opacity"
                >
                  Create one now
                </motion.button>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
