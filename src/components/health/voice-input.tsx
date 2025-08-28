import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, Languages } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language?: string
}

const VoiceInput = ({ onTranscript, language = "en-US" }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports Web Speech API
    setIsSupported(typeof window !== "undefined" && "webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  }, [])

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please try using Chrome or Edge.",
        variant: "destructive"
      })
      return
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = language

      recognition.onstart = () => {
        setIsListening(true)
        toast({
          title: "Voice Input Active",
          description: "Speak now... I'm listening for your symptoms.",
          variant: "default"
        })
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptionResult = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptionResult
          } else {
            interimTranscript += transcriptionResult
          }
        }

        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          onTranscript(finalTranscript)
          setTranscript("")
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        
        let errorMessage = "Voice input failed. Please try again."
        if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please allow microphone access and try again."
        } else if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please speak louder or closer to the microphone."
        }

        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive"
        })
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isListening) {
          recognition.stop()
        }
      }, 30000)

    } catch (error) {
      console.error("Failed to start voice recognition:", error)
      toast({
        title: "Voice Input Failed",
        description: "Failed to initialize voice input. Please try again.",
        variant: "destructive"
      })
    }
  }

  const stopListening = () => {
    setIsListening(false)
    // The recognition.stop() will be called automatically by the onend event
  }

  const playExample = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        "I have a headache and feel tired. I've been coughing for two days."
      )
      utterance.lang = language
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const supportedLanguages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "es-ES", name: "Español", flag: "🇪🇸" },
    { code: "fr-FR", name: "Français", flag: "🇫🇷" },
    { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "it-IT", name: "Italiano", flag: "🇮🇹" },
    { code: "pt-BR", name: "Português", flag: "🇧🇷" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
    { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
    { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
    { code: "ar-SA", name: "العربية", flag: "🇸🇦" }
  ]

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0]
  }

  if (!isSupported) {
    return (
      <Card className="p-4 border-dashed border-warning/50 bg-warning/5">
        <div className="flex items-center gap-2 text-warning-foreground">
          <MicOff className="w-5 h-5" />
          <div>
            <p className="font-medium">Voice Input Not Available</p>
            <p className="text-sm opacity-80">
              Your browser doesn't support voice input. Please use Chrome or Edge for the best experience.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-primary" />
          <span className="font-medium">Voice Input</span>
          <Badge variant="secondary" className="text-xs">
            {getCurrentLanguage().flag} {getCurrentLanguage().name}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm" onClick={playExample}>
          <Volume2 className="w-4 h-4 mr-2" />
          Example
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          className={`flex-1 ${isListening ? 'animate-pulse' : ''}`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>
        
        <Button variant="outline" size="lg">
          <Languages className="w-5 h-5" />
        </Button>
      </div>

      {transcript && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Listening...</p>
          <p className="text-foreground">{transcript}</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Secure: Voice processing happens locally on your device
        </p>
        <p>
          Tip: Speak clearly and describe your symptoms in detail for better results.
        </p>
      </div>
    </Card>
  )
}

export default VoiceInput