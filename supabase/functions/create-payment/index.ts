import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, email } = await req.json();

    // Paystack API configuration
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
      console.error('Paystack secret key missing');
      throw new Error('Paystack API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Generate unique reference
    const reference = `ht_${Date.now()}_${user.id.substring(0, 8)}`;

    // Create transaction record in database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: 'KES',
        reference: reference,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create transaction record');
    }

    // Create Paystack payment
    const paystackData = {
      email: email,
      amount: amount * 100, // Paystack expects amount in kobo (cents)
      currency: 'KES',
      reference: reference,
      callback_url: `${req.headers.get('origin')}/payment-success?reference=${reference}`,
      metadata: {
        user_id: user.id,
        transaction_id: transaction.id
      }
    };

    console.log('Creating Paystack payment:', { 
      amount: paystackData.amount, 
      currency: 'KES', 
      email, 
      reference 
    });

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify(paystackData),
    });

    const responseData = await response.json();
    console.log('Paystack API Response:', response.status, responseData);

    if (!response.ok || !responseData.status) {
      console.error('Paystack API Error:', responseData);
      
      // Enhanced error handling
      let errorMessage = 'Failed to create payment';
      if (response.status === 400) {
        errorMessage = 'Invalid payment information provided';
      } else if (response.status === 401) {
        errorMessage = 'Payment service authentication failed';  
      } else if (response.status >= 500) {
        errorMessage = 'Payment service temporarily unavailable';
      }
      
      throw new Error(errorMessage);
    }

    console.log('Paystack payment created successfully:', responseData.data);

    return new Response(JSON.stringify({
      checkout_url: responseData.data.authorization_url,
      reference: reference,
      access_code: responseData.data.access_code,
      status: 'created'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-payment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Payment could not be processed. Please try again or use an alternative method (M-Pesa, Card, Bank).'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});