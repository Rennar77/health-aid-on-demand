import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, severity } = await req.json();
    const hfApiKey = Deno.env.get('HUGGING_FACE_API_KEY');

    if (!hfApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const prompt = `The user has symptoms: ${symptoms} with ${severity} severity. Give simple health advice in 2-3 sentences and suggest if a doctor visit is needed.`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        headers: { 
          Authorization: `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true
          }
        }),
      }
    );

    if (!response.ok) {
      console.error('HF API Error:', response.status, await response.text());
      throw new Error('Failed to get AI advice');
    }

    const result = await response.json();
    const aiAdvice = result[0]?.generated_text || "Unable to generate advice right now. Please consult a healthcare professional.";

    // Determine if situation is urgent based on keywords and severity
    const urgentKeywords = ['severe', 'chest pain', 'difficulty breathing', 'unconscious', 'bleeding', 'emergency', 'urgent', 'immediate'];
    const isUrgent = severity === 'high' || urgentKeywords.some(keyword => 
      symptoms.toLowerCase().includes(keyword) || aiAdvice.toLowerCase().includes(keyword)
    );

    const nextSteps = isUrgent ? [
      "Seek immediate medical attention",
      "Consider calling emergency services if symptoms worsen",
      "Do not delay medical care"
    ] : [
      "Monitor your symptoms closely",
      "Stay hydrated and get adequate rest",
      "Consider visiting a healthcare provider if symptoms persist or worsen",
      "Follow general health guidelines"
    ];

    return new Response(JSON.stringify({
      advice: aiAdvice,
      isUrgent,
      nextSteps
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-ai-advice function:', error);
    
    // Always provide helpful fallback advice
    const isHighSeverity = severity === 'high';
    const fallbackAdvice = {
      advice: isHighSeverity 
        ? "Based on your symptoms, we recommend seeking medical attention promptly."
        : "Here are some general wellness recommendations for your symptoms.",
      isUrgent: isHighSeverity,
      nextSteps: [
        isHighSeverity ? "Seek medical attention promptly" : "Monitor your symptoms regularly",
        "Stay hydrated and get enough rest",
        "Consult a healthcare provider if symptoms persist or worsen"
      ]
    };

    return new Response(JSON.stringify(fallbackAdvice), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});