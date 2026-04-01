import { api } from "@/shared/api/api"
import { ENDPOINTS } from "@/shared/api/endpoints"

export const submitSpeaking = (blob: Blob) => {
  const formData = new FormData()
  formData.append("audio", blob)

  return api.upload(ENDPOINTS.SPEAKING_SUBMIT, formData)
}