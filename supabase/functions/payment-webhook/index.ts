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
    const webhookData = await req.json();
    console.log('IntaSend webhook received:', webhookData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract payment information from webhook
    const {
      invoice_id,
      api_ref,
      state,
      charges,
      net_amount,
      currency,
      value,
      account,
      failed_reason,
      created_at
    } = webhookData;

    // Determine payment status
    let paymentStatus = 'pending';
    if (state === 'COMPLETE' || state === 'PAID') {
      paymentStatus = 'success';
    } else if (state === 'FAILED' || state === 'CANCELLED') {
      paymentStatus = 'failed';
    }

    console.log('Processing payment update:', {
      api_ref,
      state,
      paymentStatus,
      amount: net_amount || value
    });

    // Update payment record in database
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        transaction_id: invoice_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', api_ref)
      .select();

    if (error) {
      console.error('Database update error:', error);
      throw error;
    }

    console.log('Payment updated successfully:', data);

    // Send success response to IntaSend
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Webhook processed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});