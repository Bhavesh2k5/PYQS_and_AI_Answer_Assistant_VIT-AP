import { useState } from "react";
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

interface OCRResponse {
  extractedText: string;
}

interface SolutionResponse {
  solutions: string;
  sessionId: string;
  modelUsed: string;
}

interface QuestionSolverProps {
  onBack: () => void;
}

export default function QuestionSolver({ onBack }: QuestionSolverProps) {
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
              onClick={onBack}
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
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      isLoading={ocrMutation.isPending}
                    />
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

        {/* OCR Results Section */}
        <AnimatePresence>
          {extractedText && inputType === "image" && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <Card className="glassmorphism p-8 shadow-2xl">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <Eye className="text-indigo-500 mr-3" />
                    Extracted Text
                  </h3>
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
                    {isEditingText ? (
                      <div className="space-y-4">
                        <Textarea
                          value={extractedText}
                          onChange={(e) => setExtractedText(e.target.value)}
                          className="min-h-32 bg-gray-700 border-gray-500 text-white"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setIsEditingText(false)}
                            size="sm"
                            className="bg-gradient-to-r from-indigo-500 to-purple-600"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setIsEditingText(false)}
                            size="sm"
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                        {extractedText}
                      </pre>
                    )}
                  </div>
                  {!isEditingText && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => setIsEditingText(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Edit Text
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                  
                  <SolutionDisplay solutions={solutions} />
                  
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