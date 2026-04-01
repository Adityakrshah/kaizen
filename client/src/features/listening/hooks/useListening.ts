import { useQuery } from "@tanstack/react-query"
import { getListening } from "../api/listening.api"

export const useListening = () => {
  return useQuery({
    queryKey: ["listening"],
    queryFn: getListening,
  })
}