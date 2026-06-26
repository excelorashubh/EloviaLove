import { motion } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';

/**
 * AuthBackground - Premium romantic animated background
 * Features: Floating hearts, blurred blobs, soft gradients
 */
const AuthBackground = () => {
  // Floating heart animations
  const hearts = [
    { delay: 0, duration: 20, x: '10%', y: '20%' },
    { delay: 2, duration: 25, x: '80%', y: '15%' },
    { delay: 4, duration: 22, x: '15%', y: '70%' },
    { delay: 6, duration: 28, x: '85%', y: '75%' },
    { delay: 3, duration: 24, x: '50%', y: '50%' },
  ];

  const sparkles = [
    { delay: 1, duration: 15, x: '20%', y: '30%' },
    { delay: 3, duration: 18, x: '70%', y: '25%' },
    { delay: 5, duration: 16, x: '30%', y: '80%' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F7] via-[#FFE7EF] via-[#FDE2E4] to-[#F8D7E5] animate-gradient-slow" />

      {/* Blurred gradient blobs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-200 to-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating hearts */}
      {hearts.map((heart, index) => (
        <motion.div
          key={`heart-${index}`}
          className="absolute"
          style={{ left: heart.x, top: heart.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.6, 0.4, 0.6, 0],
            y: [0, -100, -200, -300, -400],
            x: [0, 20, -10, 15, 0],
            rotate: [0, 10, -10, 5, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut",
          }}
        >
          <Heart
            className="text-pink-400"
            size={24}
            fill="currentColor"
            opacity={0.3}
          />
        </motion.div>
      ))}

      {/* Floating sparkles */}
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={`sparkle-${index}`}
          className="absolute"
          style={{ left: sparkle.x, top: sparkle.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1, 1.2, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <Sparkles
            className="text-amber-300"
            size={20}
            opacity={0.4}
          />
        </motion.div>
      ))}

      {/* Subtle stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        >
          <Star className="text-yellow-300" size={12} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

export default AuthBackground;
