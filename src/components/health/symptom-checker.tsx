import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Heart, Info } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import VoiceInput from "@/components/health/voice-input"

interface SymptomResult {
  condition: string
  likelihood: number
  severity: 'low' | 'medium' | 'high'
  description: string
  recommendations: string[]
}

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<SymptomResult[]>([])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])

  const commonSymptoms = [
    "Headache", "Fever", "Cough", "Fatigue", "Nausea", "Sore throat",
    "Body aches", "Shortness of breath", "Dizziness", "Chest pain"
  ]

  const mockAnalyzeSymptoms = async (symptomList: string[]) => {
    // Mock AI analysis - in production, this would use actual ML model
    setIsAnalyzing(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResults: SymptomResult[] = [
      {
        condition: "Common Cold",
        likelihood: 75,
        severity: 'low',
        description: "Viral infection affecting the upper respiratory tract",
        recommendations: [
          "Get plenty of rest and stay hydrated",
          "Use over-the-counter medications for symptom relief",
          "Consider seeing a doctor if symptoms worsen or persist beyond 10 days"
        ]
      },
      {
        condition: "Seasonal Allergies",
        likelihood: 45,
        severity: 'low',
        description: "Allergic reaction to environmental allergens",
        recommendations: [
          "Avoid known allergens when possible",
          "Consider antihistamine medications",
          "Consult an allergist for comprehensive testing"
        ]
      },
      {
        condition: "Viral Infection",
        likelihood: 60,
        severity: 'medium',
        description: "General viral illness requiring monitoring",
        recommendations: [
          "Monitor symptoms closely",
          "Seek medical attention if fever exceeds 101.5°F",
          "Stay isolated to prevent spreading to others"
        ]
      }
    ]
    
    setResults(mockResults)
    setIsAnalyzing(false)
  }

  const addSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
  }

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom))
  }

  const handleAnalyze = () => {
    const allSymptoms = [...selectedSymptoms]
    if (symptoms.trim()) {
      allSymptoms.push(symptoms.trim())
    }
    
    if (allSymptoms.length > 0) {
      mockAnalyzeSymptoms(allSymptoms)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'health-status-good'
      case 'medium': return 'health-status-warning'
      case 'high': return 'health-status-critical'
      default: return 'health-status-good'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Info className="w-4 h-4" />
      case 'medium': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-destructive" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <section className="py-16 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 gradient-hero rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-Powered Symptom Checker</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant insights into your symptoms with our advanced AI technology. 
              Always consult healthcare professionals for accurate diagnosis.
            </p>
          </div>

          <Card className="shadow-medium p-6">
            <div className="space-y-6">
              {/* Voice Input Component */}
              <VoiceInput 
                onTranscript={(text) => setSymptoms(text)}
                language="en-US"
              />
              
              {/* Symptom Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Describe your symptoms
                </label>
                <Input
                  placeholder="e.g., I have a persistent cough and feel tired..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="mb-4"
                />
                
                {/* Quick symptom selection */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Or select from common symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                        className="cursor-pointer transition-smooth hover:scale-105"
                        onClick={() => 
                          selectedSymptoms.includes(symptom) 
                            ? removeSymptom(symptom) 
                            : addSymptom(symptom)
                        }
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Selected symptoms */}
                {selectedSymptoms.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Selected symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="cursor-pointer">
                          {symptom}
                          <button
                            onClick={() => removeSymptom(symptom)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <HeroButton
                  variant="medical"
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (selectedSymptoms.length === 0 && !symptoms.trim())}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    "Analyze Symptoms"
                  )}
                </HeroButton>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <strong>Important:</strong> This is an AI-powered assessment for informational purposes only. 
                          Always consult with healthcare professionals for proper diagnosis and treatment.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {results.map((result, index) => (
                    <Card key={index} className={`p-4 border-l-4 ${getSeverityColor(result.severity)} border-l-current`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(result.severity)}
                          <h4 className="text-lg font-semibold">{result.condition}</h4>
                        </div>
                        <Badge variant="secondary" className={getSeverityColor(result.severity)}>
                          {result.likelihood}% match
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{result.description}</p>
                      
                      <div>
                        <h5 className="font-medium mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                  
                  <div className="text-center">
                    <HeroButton variant="hero" size="lg">
                      Find Nearby Clinics
                    </HeroButton>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default SymptomChecker