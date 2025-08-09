import { motion, useScroll, useTransform } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";
import { Sparkles, Brain, Zap, Star } from "lucide-react";

interface SolutionDisplayProps {
  solutions: string;
}

export default function SolutionDisplay({ solutions }: SolutionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Parallax Background Images */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <motion.div 
          style={{ y }}
          className="absolute -top-20 -right-20 w-96 h-96 opacity-5"
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        </motion.div>
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
          className="absolute -bottom-20 -left-20 w-96 h-96 opacity-5"
        >
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-cyan-500 to-indigo-500 rounded-full blur-3xl"></div>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative bg-gradient-to-br from-gray-900/80 via-slate-900/90 to-black/80 backdrop-blur-xl rounded-2xl border border-gray-600/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-6 border-b border-gray-600/30">
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI-Generated Solutions
            </h3>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-2 left-2">
            <Star className="w-4 h-4 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute top-4 right-8">
            <Zap className="w-3 h-3 text-blue-400 opacity-40" />
          </div>
          <div className="absolute bottom-2 right-2">
            <Star className="w-3 h-3 text-purple-400 opacity-50" />
          </div>
        </div>

        {/* Solutions Content */}
        <div className="p-8">
          <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed space-y-6">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold text-white mb-6 flex items-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                  >
                    <Sparkles className="w-8 h-8 mr-3 text-yellow-500" />
                    {children}
                  </motion.h1>
                ),
                h2: ({ children }) => (
                  <motion.h2 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-white mb-4 flex items-center"
                  >
                    <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                    {children}
                  </motion.h2>
                ),
                h3: ({ children }) => (
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-semibold text-indigo-200 mb-3 flex items-center"
                  >
                    <span className="text-indigo-400 mr-2">▸</span>
                    {children}
                  </motion.h3>
                ),
                p: ({ children }) => (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-200 mb-4 leading-relaxed text-lg"
                  >
                    {children}
                  </motion.p>
                ),
                strong: ({ children }) => (
                  <strong className="text-yellow-300 font-bold bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="text-purple-300 italic font-medium">{children}</em>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-900/90 px-3 py-1 rounded-lg text-emerald-300 font-mono text-base border border-emerald-500/30 shadow-inner">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <motion.pre 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-gray-900/95 to-black/90 p-6 rounded-xl overflow-x-auto border border-gray-600/50 shadow-2xl my-6 relative"
                  >
                    <div className="absolute top-2 left-4 flex space-x-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <code className="text-emerald-300 font-mono text-base mt-6 block">{children}</code>
                  </motion.pre>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-3 mb-6 pl-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="space-y-3 mb-6 pl-4 list-decimal list-inside">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 text-gray-200"
                  >
                    <span className="text-indigo-400 mt-2 text-lg">●</span>
                    <span className="text-lg leading-relaxed">{children}</span>
                  </motion.li>
                ),
                blockquote: ({ children }) => (
                  <motion.blockquote 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-4 border-indigo-500 pl-6 italic text-gray-300 my-6 bg-indigo-500/10 py-4 rounded-r-lg relative"
                  >
                    <div className="absolute top-2 left-2 text-indigo-400 opacity-50">
                      <span className="text-2xl">"</span>
                    </div>
                    {children}
                  </motion.blockquote>
                ),
              }}
            >
              {solutions}
            </ReactMarkdown>
          </div>
        </div>

        {/* Floating Action Indicators */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-3 h-3 bg-green-400 rounded-full opacity-60"
          ></motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-2 h-2 bg-blue-400 rounded-full opacity-40"
          ></motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
