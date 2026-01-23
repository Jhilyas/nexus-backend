// ═══════════════════════════════════════════════════════════════
// NEXUS - AI CHAT EDGE FUNCTION (Powered by MISTRAL AI)
// Deploy to: supabase/functions/ai-chat/index.ts
// ═══════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

Règles IMPORTANTES:
- Tu dois répondre de manière ULTRA CONCISE (2-3 phrases maximum).
- Réponds dans la même langue que l'utilisateur (français, arabe ou anglais).
- Sois direct et utile. Pas de blabla.
- Utilise des emojis avec modération.`;

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message, conversationHistory = [], mode = 'mentor', language = 'fr' } = await req.json();
        const apiKey = Deno.env.get('MISTRAL_API_KEY');

        if (!apiKey) {
            throw new Error('Missing MISTRAL_API_KEY');
        }

        const modePrompts = {
            mentor: 'Tu es un mentor éducatif professionnel et sage.',
            friend: 'Tu es un ami proche. Tu parles de manière décontractée.',
            motivator: 'Tu es un coach motivant! Tu encourages avec énergie!',
            calm: 'Tu es calme et rassurant.'
        };

        const currentModePrompt = modePrompts[mode] || modePrompts.mentor;
        const systemInstruction = `${SAGE_SYSTEM_PROMPT}\n\nMode actuel: ${currentModePrompt}\nRAPPEL: SOIS BREF.`;

        // Mistral API Payload (OpenAI Compatible)
        const messages = [
            { role: 'system', content: systemInstruction },
            ...conversationHistory.slice(-8).map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Call Mistral API
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                safe_prompt: true
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mistral API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content;

        if (!reply) {
            throw new Error('Empty response from Mistral');
        }

        return new Response(
            JSON.stringify({
                success: true,
                response: reply,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error: any) {
        console.error('AI Chat Error:', error);

        const fallbackResponses: any = {
            fr: "Désolé, je rencontre un petit problème. Peux-tu répéter ?",
            ar: "عذراً، أواجه مشكلة تقنية بسيطة. هل يمكنك إعادة السؤال؟",
            en: "Sorry, having a small issue. Can you repeat that?"
        };

        return new Response(
            JSON.stringify({
                success: false,
                response: `${fallbackResponses.fr} (Debug: ${error.message})`,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );
    }
});
