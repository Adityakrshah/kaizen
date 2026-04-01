import Vocabulary from "../models/vocabulary.model"

export const fetchVocabulary = async (
  page: number,
  limit: number,
  search?: string
) => {
  const query: any = {}

  if (search) {
    query.word = { $regex: search, $options: "i" }
  }

  const skip = (page - 1) * limit

  const words = await Vocabulary.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ word: 1 })

  const total = await Vocabulary.countDocuments(query)

  return {
    words,
    total,
    page,
    pages: Math.ceil(total / limit)
  }
}