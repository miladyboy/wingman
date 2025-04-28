type UserPromptParams = {
  history?: string;
  message?: string;
  imageDescription?: string;
};

function userPrompt({ history, message, imageDescription }: UserPromptParams): string {
  let prompt = "";

  if (history) {
    prompt += `Chat history:\n${history}\n\n`;
  }
  if (message) {
    prompt += `Latest message:\n${message}\n\n`;
  }
  if (imageDescription) {
    prompt += `[Image Description: ${imageDescription}]\n`;
  }

  // Add more dynamic logic as needed
  return prompt.trim();
}

export default userPrompt; 