import { useMutation } from "@tanstack/react-query"
import { submitSpeaking } from "../api/speaking.api"

export const useSubmitSpeaking = () => {
  return useMutation({
    mutationFn: submitSpeaking,
  })
}