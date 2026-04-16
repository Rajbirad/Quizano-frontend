import { makeAuthenticatedFormRequest } from './api-utils';

export const chatWithVideo = async (videoId: string, message: string) => {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('video_id', videoId);
    formData.append('message', message);

    // Call the chat API
    const response = await makeAuthenticatedFormRequest(
      'https://127.0.0.1:8000/api/video/chat',
      formData
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.response || data.answer,
      message: data.message
    };
  } catch (error: any) {
    return {
      success: false,
      answer: null,
      message: error.message || 'Failed to get response from AI'
    };
  }
};
