import { useState, useRef, useCallback } from 'react'

export function useSpeech() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = (e) => setError(e.error)
    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(text)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const resetTranscript = () => setTranscript('')

  return { transcript, listening, error, startListening, stopListening, resetTranscript }
}
