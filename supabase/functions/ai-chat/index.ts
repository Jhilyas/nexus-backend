// ═══════════════════════════════════════════════════════════════
// NEXUS - AI CHAT EDGE FUNCTION FOR SUPABASE
// Deploy to: supabase/functions/ai-chat/index.ts
// ═══════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAGE_SYSTEM_PROMPT = `Tu es SAGE, l'assistant IA de NEXUS, la plateforme d'orientation éducative au Maroc.

Ton rôle:
- Guider les étudiants dans leur parcours post-baccalauréat
- Fournir des informations sur les écoles, programmes et carrières au Maroc
- Être supportif, knowledgeable, et encourageant

Tes connaissances:
- Système éducatif marocain (Classes Préparatoires, Grandes Écoles, Universités)
- Écoles: ENSIAS, EMI, INPT, ENCG, ENSAM, UM6P, HEM, EHTP, ISCAE, etc.
- Concours: CNC, TAFEM, concours spécifiques
- Carrières et salaires au Maroc
- Bourses et aides financières

Règles:
- Réponds dans la même langue que l'utilisateur (français, arabe ou anglais)
- Sois concis: 2-3 paragraphes maximum
- Utilise des emojis avec modération`;

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message, conversationHistory = [], mode = 'mentor', language = 'fr' } = await req.json();

        const modePrompts = {
            mentor: 'Tu es un mentor éducatif professionnel, sage et expérimenté.',
            friend: 'Tu es un ami proche et bienveillant. Tu parles de manière décontractée.',
            motivator: 'Tu es un coach motivant et énergique! Tu encourages avec enthousiasme!',
            calm: 'Tu es calme, posé et rassurant. Tu aides à réduire le stress.'
        };

        const systemPrompt = `${SAGE_SYSTEM_PROMPT}\n\nMode actuel: ${modePrompts[mode] || modePrompts.mentor}`;

        // Build messages for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-8).map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Call Groq API (LLaMA 3.3)
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                max_tokens: 1024,
                temperature: mode === 'calm' ? 0.5 : mode === 'motivator' ? 0.9 : 0.7
            })
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            throw new Error(`Groq API error: ${groqResponse.status} - ${errorText}`);
        }

        const completion = await groqResponse.json();
        const reply = completion.choices[0].message.content;

        return new Response(
            JSON.stringify({
                success: true,
                response: reply,
                usage: completion.usage
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );
    } catch (error: any) {
        console.error('AI Chat Error:', error);

        const fallbackResponses = {
            fr: "Désolé, je réfléchis trop vite ! Peux-tu répéter ?",
            ar: "عذراً، أواجه مشكلة تقنية بسيطة. هل يمكنك إعادة السؤال؟",
            en: "Sorry, I'm thinking too fast! Can you repeat that?"
        };

        return new Response(
            JSON.stringify({
                success: false,
                response: fallbackResponses.fr,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );
    }
});
