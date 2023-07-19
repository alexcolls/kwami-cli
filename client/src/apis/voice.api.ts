import axios, { AxiosResponse } from "axios";
import { $API_KEY } from "../config";

interface LaunchJobResponse {
  job_id: string;
  providers: string[];
}

interface LaunchJobRequest {
  providers: string;
  show_original_response?: boolean;
  webhook_receiver?: string;
  users_webhook_parameters?: {
    settings?: {
      file?: File;
      file_url?: string;
      language?: string;
      speakers?: number;
      profanity_filter?: boolean;
      custom_vocabulary?: string;
      convert_to_wav?: boolean;
    };
  };
}

const launchSpeechToTextJob = async (
  request: LaunchJobRequest
): Promise<AxiosResponse<LaunchJobResponse>> => {
  const apiKey = $API_KEY; // Replace with your actual API key
  const endpoint = "https://api.edenai.run/v2/audio/speech_to_text_async";

  try {
    const response = await axios.post<LaunchJobResponse>(endpoint, request, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error launching speech to text job:", error);
    throw error;
  }
};

// Example usage
const launchJobRequest: LaunchJobRequest = {
  providers: "amazon,microsoft,google",
  show_original_response: true,
  webhook_receiver: "https://your.listener.com/endpoint",
  users_webhook_parameters: {
    settings: {
      file_url: "https://example.com/audio/file.wav",
      language: "en",
      speakers: 2,
      profanity_filter: true,
      custom_vocabulary: "Word, Mike, Draw, Los Angeles",
      convert_to_wav: true,
    },
  },
};

launchSpeechToTextJob(launchJobRequest)
  .then((response) => {
    console.log("Speech to text job launched successfully:", response.data);
  })
  .catch((error) => {
    console.error("Error launching speech to text job:", error);
  });
