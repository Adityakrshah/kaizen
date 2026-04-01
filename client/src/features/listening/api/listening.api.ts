import { api } from "@/shared/api/api"
import { ENDPOINTS } from "@/shared/api/endpoints"

export const getListening = () =>
  api.get(ENDPOINTS.LISTENING_GENERATE)