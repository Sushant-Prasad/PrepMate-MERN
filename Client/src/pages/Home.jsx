import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center px-6"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4">
          Welcome to <span className="text-indigo-600">PrepMate</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-6">
          Your all-in-one study companion for mastering{" "}
          <span className="font-semibold">DSA</span>,{" "}
          <span className="font-semibold">Aptitude</span>, and{" "}
          <span className="font-semibold">Interview Prep</span>.
        </p>

        <div className="flex gap-4 justify-center">
          <Button className="rounded-2xl px-6 py-3 text-lg shadow-md">
            Start Learning
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl px-6 py-3 text-lg border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            Join a Study Room
          </Button>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl px-6"
      >
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-indigo-600 mb-2">💻 DSA Practice</h3>
          <p className="text-gray-600">
            Solve coding challenges, track streaks, and run code with Judge0 integration.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-indigo-600 mb-2">📊 Aptitude Tests</h3>
          <p className="text-gray-600">
            Sharpen problem-solving skills with daily aptitude challenges and timed quizzes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-indigo-600 mb-2">👥 Study Rooms</h3>
          <p className="text-gray-600">
            Join collaborative rooms to discuss problems, share resources, and grow together.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
