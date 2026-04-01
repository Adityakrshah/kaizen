import dotenv from "dotenv"
import { generateAudioFromText } from "../services/tts.service"

dotenv.config()

async function test() {
  try {
    const audio = await generateAudioFromText(
      "Hello. my name is aditya i am a very good boy i like to sing and dance acoording to my aunt"
    )

    console.log("Audio generated at:", audio)
  } catch (error) {
    console.error("TTS failed:", error)
  }
}

test()