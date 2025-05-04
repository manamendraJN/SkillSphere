import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import QAPage from './pages/QAPage.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Feed from './pages/PostFeed.jsx'; // Make sure this path is correct
import './index.css';
import { Toaster } from 'react-hot-toast';

const LearningPlans = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-gray-950 dark:text-gray-600 mt-5 ml-8"
  >
    Learning Plans Page (TBD)
  </motion.div>
);

const SkillPosts = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-gray-800 dark:text-gray-600 mt-5 ml-8"
  >
    Skill Posts Page (TBD)
  </motion.div>
);

const Profile = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-gray-800 dark:text-gray-600 mt-5 ml-8"
  >
    Profile Page (TBD)
  </motion.div>
);

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-600 mt-16">
        Welcome to SkillSphere
      </h1>
      <p className="text-gray-600 dark:text-gray-500 mt-6 mb-10">
        Explore a community of learners and experts. Ask questions, share knowledge, and grow your skills!
      </p>

      {/* Feed section integrated below the welcome message */}
      <Feed />
    </motion.div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-teal-50">
      <Toaster />
      <Header />
      <div className="pt-16 md:pl-80">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/q&a-form" element={<QAPage />} />
          <Route path="/learning-plans" element={<LearningPlans />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skill-posts" element={<CreatePost />} />
          {/* <Route path="/feed" element={<Feed />} /> */}
        </Routes>
      </div>
    </div>
  );
}

export default App;
