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
      console.error('IntaSend API keys missing:', { 
        hasPublishable: !!intasendPublishableKey, 
        hasSecret: !!intasendSecretKey 
      });
      throw new Error('IntaSend API keys not configured');
    }

    // Create checkout session with IntaSend Collection API
    const checkoutData = {
      public_key: intasendPublishableKey,
      amount: amount,
      currency: 'KES',
      email: email,
      phone_number: '', // Optional for M-Pesa
      api_ref: paymentId,
      redirect_url: `${req.headers.get('origin')}/payment-success?payment_id=${paymentId}`,
      comment: 'Premium Health Advice - HealthTrack App',
      webhook_endpoint: `${req.headers.get('origin')}/api/webhooks/intasend`
    };

    console.log('Creating IntaSend checkout with data:', { 
      amount, 
      currency: 'KES', 
      email, 
      api_ref: paymentId 
    });

    // Use IntaSend Collection API
    const response = await fetch('https://sandbox.intasend.com/api/v1/payment/collection/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-IntaSend-Public-API-Key': intasendPublishableKey,
      },
      body: JSON.stringify(checkoutData),
    });

    const responseText = await response.text();
    console.log('IntaSend API Response:', response.status, responseText);

    if (!response.ok) {
      console.error('IntaSend API Error:', response.status, responseText);
      
      // Parse error response
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      
      // Enhanced error handling
      let errorMessage = 'Failed to create payment checkout';
      if (response.status === 400) {
        errorMessage = 'Invalid payment information provided';
      } else if (response.status === 401) {
        errorMessage = 'Payment service authentication failed';  
      } else if (response.status >= 500) {
        errorMessage = 'Payment service temporarily unavailable';
      }
      
      throw new Error(errorMessage);
    }

    const result = JSON.parse(responseText);
    console.log('Payment created successfully:', result);

    return new Response(JSON.stringify({
      checkout_url: result.url || result.redirect_url,
      payment_id: paymentId,
      reference: result.id || result.invoice,
      status: 'created'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Payment could not be processed. Please try again or use an alternative method (Mpesa, Card, PayPal).'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});