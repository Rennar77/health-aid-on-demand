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
    console.log('Paystack webhook received:', webhookData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract payment information from Paystack webhook
    const {
      event,
      data: paymentData
    } = webhookData;

    // Only process charge success events
    if (event !== 'charge.success') {
      console.log('Ignoring non-success event:', event);
      return new Response(JSON.stringify({
        status: 'success',
        message: 'Event ignored'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      reference,
      amount,
      currency,
      status,
      metadata
    } = paymentData;

    console.log('Processing payment update:', {
      reference,
      status,
      amount,
      currency
    });

    // Update transaction record in database
    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: status === 'success' ? 'success' : 'failed',
      })
      .eq('reference', reference)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Transaction updated successfully:', transaction);

    // If payment was successful, update user to premium
    if (status === 'success' && transaction) {
      const { error: premiumError } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('id', transaction.user_id);

      if (premiumError) {
        console.error('Error updating user premium status:', premiumError);
      } else {
        console.log('User upgraded to premium:', transaction.user_id);
      }
    }

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