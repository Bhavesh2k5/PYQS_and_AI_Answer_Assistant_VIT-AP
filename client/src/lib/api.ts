export const API_ENDPOINTS = {
  OCR: "/api/ocr",
  SOLUTIONS: "/api/solutions",
  SESSIONS: "/api/sessions",
} as const;

export interface APIError {
  error: string;
  details?: any;
}

export async function uploadImageForOCR(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(API_ENDPOINTS.OCR, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error || "OCR processing failed");
  }

  const data = await response.json();
  return data.extractedText;
}

export async function generateSolutions(questions: string): Promise<{
  solutions: string;
  sessionId: string;
  modelUsed: string;
}> {
  const response = await fetch(API_ENDPOINTS.SOLUTIONS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ questions }),
  });

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error || "Solution generation failed");
  }

  return response.json();
}

export async function getSession(sessionId: string) {
  const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${sessionId}`);

  if (!response.ok) {
    const error: APIError = await response.json();
    throw new Error(error.error || "Failed to retrieve session");
  }

  return response.json();
}
