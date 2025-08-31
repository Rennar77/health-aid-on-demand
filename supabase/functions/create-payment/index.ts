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
    const { amount, paymentId, email } = await req.json();

    // IntaSend API configuration
    const intasendPublishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY');
    const intasendSecretKey = Deno.env.get('INTASEND_SECRET_KEY');

    if (!intasendPublishableKey || !intasendSecretKey) {
      throw new Error('IntaSend API keys not configured');
    }

    // Create checkout session with IntaSend
    const checkoutData = {
      amount: amount,
      currency: 'USD',
      email: email,
      phone_number: '', // Optional
      api_ref: paymentId,
      redirect_url: `${req.headers.get('origin')}/payment-success?payment_id=${paymentId}`,
      comment: 'Premium Health Advice'
    };

    const response = await fetch('https://payment.intasend.com/api/v1/checkout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-IntaSend-Public-API-Key': intasendPublishableKey,
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('IntaSend API Error:', response.status, errorData);
      throw new Error('Failed to create payment checkout');
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      checkout_url: result.url,
      payment_id: paymentId,
      reference: result.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create payment'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});