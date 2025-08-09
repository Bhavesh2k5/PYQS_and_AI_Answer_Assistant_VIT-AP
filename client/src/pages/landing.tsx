import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Upload, Type, Lightbulb, Eye, Download, Copy, Plus, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import SolutionDisplay from "@/components/solution-display";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Declare spline-viewer as a custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': {
        className?: string;
        url?: string;
      };
    }
  }
}

interface OCRResponse {
  extractedText: string;
}

interface SolutionResponse {
  solutions: string;
  sessionId: string;
  modelUsed: string;
}

export default function Landing() {
  const [showSolver, setShowSolver] = useState(false);
  const [inputType, setInputType] = useState<"image" | "text">("image");
  const [textInput, setTextInput] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [solutions, setSolutions] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);
  const { toast } = useToast();

  const ocrMutation = useMutation({
    mutationFn: async (file: File): Promise<OCRResponse> => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OCR processing failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedText(data.extractedText);
      toast({
        title: "Text Extracted Successfully",
        description: "Review the extracted text before generating solutions.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "OCR Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const solutionMutation = useMutation({
    mutationFn: async (questions: string): Promise<SolutionResponse> => {
      const response = await apiRequest("POST", "/api/solutions", { questions });
      return response.json();
    },
    onSuccess: (data) => {
      setSolutions(data.solutions);
      setCurrentSessionId(data.sessionId);
      setModelUsed(data.modelUsed);
      toast({
        title: "Solutions Generated",
        description: `Using model: ${data.modelUsed}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Solution Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    ocrMutation.mutate(file);
  };

  const handleGenerateSolutions = () => {
    const questions = inputType === "image" ? extractedText : textInput;
    if (!questions.trim()) {
      toast({
        title: "No Text Found",
        description: "Please provide questions to solve.",
        variant: "destructive",
      });
      return;
    }
    solutionMutation.mutate(questions);
  };

  const handleCopySolutions = async () => {
    try {
      await navigator.clipboard.writeText(solutions);
      toast({
        title: "Copied to Clipboard",
        description: "Solutions have been copied successfully.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy solutions to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setTextInput("");
    setExtractedText("");
    setSolutions("");
    setCurrentSessionId("");
    setModelUsed("");
    setIsEditingText(false);
  };

  const isProcessing = ocrMutation.isPending || solutionMutation.isPending;

  useEffect(() => {
    // Load Spline viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.38/build/spline-viewer.js';
    document.head.appendChild(script);

    // Add cursor tracking for robot interaction
    const handleMouseMove = (e: MouseEvent) => {
      const splineViewer = document.querySelector('spline-viewer') as any;
      if (splineViewer && splineViewer.emitEventReverse) {
        // Convert screen coordinates to normalized device coordinates
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Emit mouse move event to Spline scene
        splineViewer.emitEventReverse('mouseMove', { x, y });
      }
    };

    // Add global mouse tracking when on landing page
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.head.removeChild(script);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (showSolver) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Back Button */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-6"
        >
          <nav className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowSolver(false)}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="text-white h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                AI Question Solver
              </h1>
            </div>
          </nav>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Transform Questions into
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent block">Solutions</span>
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload your question paper image or paste text, and get detailed AI-powered solutions instantly.
            </p>
          </motion.section>

          {/* Input Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <Card className="glassmorphism p-8 shadow-2xl">
              <CardContent className="p-0">
                {/* Input Type Selection */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-800/80 rounded-xl p-2 flex space-x-2">
                    <Button
                      onClick={() => setInputType("image")}
                      variant={inputType === "image" ? "default" : "ghost"}
                      className={inputType === "image" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" : "text-gray-300 hover:text-white hover:bg-gray-700"}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <Button
                      onClick={() => setInputType("text")}
                      variant={inputType === "text" ? "default" : "ghost"}
                      className={inputType === "text" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg" : "text-gray-300 hover:text-white hover:bg-gray-700"}
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Paste Text
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {inputType === "image" ? (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4">
                        <FileUpload
                          onFileSelect={handleFileUpload}
                          isLoading={ocrMutation.isPending}
                        />
                        <div className="text-center">
                          <Button
                            onClick={() => document.getElementById('additional-file-input')?.click()}
                            variant="outline"
                            className="border-gray-600 hover:bg-gray-700 hover:border-indigo-500"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Another Image
                          </Button>
                          <input
                            id="additional-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Textarea
                        placeholder="Paste your question paper text here..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="min-h-64 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Process Button */}
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleGenerateSolutions}
                    disabled={isProcessing || (!textInput.trim() && !extractedText.trim())}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isProcessing ? (
                      <LoadingSpinner className="w-5 h-5 mr-2" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    {isProcessing ? "Processing..." : "Generate Solutions"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* OCR Results Section - Compact */}
          <AnimatePresence>
            {extractedText && inputType === "image" && (
              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8"
              >
                <motion.div 
                  className="glassmorphism p-4 shadow-lg rounded-lg border-l-4 border-indigo-500"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center text-gray-200">
                      <Eye className="text-indigo-400 mr-2 w-4 h-4" />
                      Extracted Text
                    </h3>
                    <Button
                      onClick={() => setIsEditingText(!isEditingText)}
                      variant="ghost"
                      size="sm"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <Type className="w-3 h-3 mr-1" />
                      {isEditingText ? "Save" : "Edit"}
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-700/50 max-h-32 overflow-y-auto">
                    {isEditingText ? (
                      <Textarea
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        className="min-h-24 bg-transparent border-none text-gray-200 text-sm resize-none focus:ring-0 p-0"
                        placeholder="Edit extracted text..."
                      />
                    ) : (
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {extractedText.length > 200 ? `${extractedText.substring(0, 200)}...` : extractedText}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Loading Section */}
          <AnimatePresence>
            {isProcessing && (
              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-16"
              >
                <Card className="glassmorphism p-12 shadow-2xl text-center">
                  <CardContent className="p-0">
                    <div className="space-y-6">
                      <div className="w-20 h-20 mx-auto">
                        <LoadingSpinner className="w-full h-full" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Processing Your Questions</h3>
                        <p className="text-gray-300">
                          {ocrMutation.isPending ? "Extracting text from image..." : "Generating AI-powered solutions..."}
                        </p>
                        {modelUsed && (
                          <Badge variant="secondary" className="mt-2">
                            Using {modelUsed}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Solutions Section */}
          <AnimatePresence>
            {solutions && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="glassmorphism p-8 shadow-2xl">
                  <CardContent className="p-0">
                    <h3 className="text-3xl font-bold mb-8 flex items-center">
                      <Lightbulb className="text-yellow-500 mr-3" />
                      AI-Generated Solutions
                    </h3>
                    
                    {solutions && solutions.trim() ? (
                      <SolutionDisplay solutions={solutions} />
                    ) : (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
                        <p className="text-red-400 mb-2 font-semibold">No Solutions Generated</p>
                        <p className="text-gray-400 text-sm">
                          The AI model returned an empty response. This might be due to API limits or model availability. 
                          Please try again or check if your question is clear.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                      <Button
                        onClick={handleCopySolutions}
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Solutions
                      </Button>
                      <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Print/Save
                      </Button>
                      <Button
                        onClick={handleReset}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </AnimatePresence>

        </main>
      </motion.div>
    );
  }

  return (
    <div className="landing-page">
      {/* Spline 3D Robot - Interactive */}
      <div className="spline-robot-container">
        <spline-viewer 
          className="spline-robot"
          url="https://prod.spline.design/iGsePslVUFpNTgG2/scene.splinecode"
        />
      </div>

      {/* Side Buttons */}
      <button 
        className="side-button left-button"
        style={{ zIndex: 100 }}
        onClick={() => console.log("Question Papers clicked")}
      >
        Question Papers
      </button>
      
      <button 
        className="side-button right-button"
        style={{ zIndex: 100 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log("Solutions button clicked - changing state!");
          setShowSolver(true);
        }}
      >
        Solutions
      </button>

      {/* Navigation */}
      <motion.nav 
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="logo">VIT AP</h1>
        <ul className="menu">
        </ul>
        <motion.button 
          className="btn1"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
        >
          AI Study
        </motion.button>
      </motion.nav>

      {/* Background Text Content */}
      <motion.main 
        className="background-text-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div
          className="advanced-logo-main"
          initial={{ opacity: 0, rotateY: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, type: "spring", stiffness: 100 }}
        >
          <div className="logo-3d-container">
            <div className="logo-layers-main">
              <div className="logo-shadow-main"></div>
              <div className="logo-base-main">AI QUESTION</div>
              <div className="logo-highlight-main">SOLVER</div>
              <div className="logo-glow-main"></div>
            </div>
            <div className="logo-particles-main">
              <span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </motion.div>
        <motion.p
          className="background-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          AI-Powered Academic Solutions
        </motion.p>
      </motion.main>
    </div>
  );
}