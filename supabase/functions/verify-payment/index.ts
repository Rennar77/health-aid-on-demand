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
    const { reference } = await req.json();

    // Paystack API configuration
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');

    if (!paystackSecretKey) {
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

    console.log('Verifying payment with reference:', reference);

    // Verify payment with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
    });

    const responseData = await response.json();
    console.log('Paystack verification response:', responseData);

    if (!response.ok || !responseData.status) {
      throw new Error('Payment verification failed');
    }

    const paymentData = responseData.data;
    const paymentStatus = paymentData.status === 'success' ? 'success' : 'failed';

    // Update transaction record in database
    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: paymentStatus,
      })
      .eq('reference', reference)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update transaction');
    }

    // If payment was successful, update user to premium
    if (paymentStatus === 'success') {
      const { error: premiumError } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('id', user.id);

      if (premiumError) {
        console.error('Error updating user premium status:', premiumError);
      } else {
        console.log('User upgraded to premium:', user.id);
      }
    }

    return new Response(JSON.stringify({
      status: 'success',
      payment_status: paymentStatus,
      transaction: transaction,
      verified: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-payment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      verified: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});