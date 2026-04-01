import { useQuery } from "@tanstack/react-query"
import { api } from "@/shared/api/api"
import { ENDPOINTS } from "@/shared/api/endpoints"

export const useProgress = () => {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => api.get(ENDPOINTS.PROGRESS),
  })
}