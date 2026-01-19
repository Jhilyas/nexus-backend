// ═══════════════════════════════════════════════════════════════
// NEXUS - AI VOICE EDGE FUNCTION (Real-time Voice Conversations)
// Deploy to: supabase/functions/ai-voice/index.ts
// ═══════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SAGE Voice System Prompt - Multilingual Educational Mentor
const SAGE_VOICE_INSTRUCTIONS = `Tu es SAGE, l'assistant vocal IA de NEXUS, la plateforme d'orientation éducative au Maroc.

COMPORTEMENT VOCAL:
- Parle naturellement avec une voix chaleureuse et rassurante
- Adapte ton débit selon le contexte (plus lent pour expliquer, plus rapide pour motiver)
- Utilise des pauses naturelles pour laisser l'utilisateur absorber l'information
- Encourage l'utilisateur s'il semble stressé ou hésitant

MULTILINGUISME:
- Détecte automatiquement la langue de l'utilisateur
- Réponds TOUJOURS dans la même langue que l'utilisateur
- Tu comprends parfaitement: Français, Arabe, Darija marocaine, Anglais
- Si l'utilisateur mélange les langues, adapte-toi naturellement
- Ne mentionne JAMAIS que tu as changé de langue

TES CONNAISSANCES:
- Système éducatif marocain (Classes Préparatoires, Grandes Écoles, Universités)
- Écoles: ENSIAS, EMI, INPT, ENCG, ENSAM, UM6P, HEM, EHTP, ISCAE, etc.
- Concours: CNC, TAFEM, concours spécifiques
- Carrières et salaires au Maroc
- Bourses et aides financières

RÈGLES:
- Sois concis à l'oral: 2-3 phrases par idée principale
- Pose des questions pour mieux comprendre les besoins
- Agis comme un mentor bienveillant, pas comme un robot
- Si tu ne sais pas, dis-le honnêtement`;

// Voice personality configurations matching AIMentor modes
const VOICE_PERSONALITIES = {
    mentor: {
        voice: 'alloy',
        instructions: 'Tu es un mentor éducatif professionnel, sage et expérimenté. Parle calmement avec autorité bienveillante.'
    },
    friend: {
        voice: 'shimmer',
        instructions: 'Tu es un ami proche et bienveillant. Parle de manière décontractée et chaleureuse.'
    },
    motivator: {
        voice: 'echo',
        instructions: 'Tu es un coach motivant et énergique! Parle avec enthousiasme et encourage!'
    },
    calm: {
        voice: 'nova',
        instructions: 'Tu es calme, posé et rassurant. Parle lentement et doucement pour réduire le stress.'
    }
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Check if this is a WebSocket upgrade request
    const upgrade = req.headers.get('upgrade') || '';

    if (upgrade.toLowerCase() === 'websocket') {
        return handleWebSocketUpgrade(req);
    }

    // Regular HTTP request - return session configuration
    try {
        const { mode = 'mentor' } = await req.json().catch(() => ({}));
        const personality = VOICE_PERSONALITIES[mode] || VOICE_PERSONALITIES.mentor;

        // Return ephemeral token configuration for client-side WebRTC
        // In production, you would generate an ephemeral key here
        return new Response(
            JSON.stringify({
                success: true,
                config: {
                    model: 'gpt-4o-realtime-preview-2024-12-17',
                    voice: personality.voice,
                    instructions: `${SAGE_VOICE_INSTRUCTIONS}\n\nMode: ${personality.instructions}`,
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500
                    },
                    input_audio_transcription: {
                        model: 'whisper-1'
                    }
                },
                wsUrl: `wss://${req.headers.get('host')}/functions/v1/ai-voice`
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );
    } catch (error) {
        console.error('AI Voice Config Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});

async function handleWebSocketUpgrade(req: Request): Promise<Response> {
    const { socket, response } = Deno.upgradeWebSocket(req);

    let openaiWs: WebSocket | null = null;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    socket.onopen = () => {
        console.log('Client connected to voice session');

        // Connect to OpenAI Realtime API
        openaiWs = new WebSocket(
            'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
            ['realtime', `openai-insecure-api-key.${OPENAI_API_KEY}`]
        );

        openaiWs.onopen = () => {
            console.log('Connected to OpenAI Realtime API');

            // Configure session with SAGE personality
            const sessionConfig = {
                type: 'session.update',
                session: {
                    modalities: ['text', 'audio'],
                    instructions: SAGE_VOICE_INSTRUCTIONS,
                    voice: 'alloy',
                    input_audio_format: 'pcm16',
                    output_audio_format: 'pcm16',
                    input_audio_transcription: {
                        model: 'whisper-1'
                    },
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500
                    }
                }
            };
            openaiWs!.send(JSON.stringify(sessionConfig));
        };

        openaiWs.onmessage = (event) => {
            // Forward OpenAI messages to client
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(event.data);
            }
        };

        openaiWs.onerror = (error) => {
            console.error('OpenAI WebSocket error:', error);
            socket.send(JSON.stringify({
                type: 'error',
                error: 'Connection to AI failed'
            }));
        };

        openaiWs.onclose = () => {
            console.log('OpenAI connection closed');
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    };

    socket.onmessage = (event) => {
        // Forward client messages to OpenAI
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(event.data);
        }
    };

    socket.onclose = () => {
        console.log('Client disconnected');
        if (openaiWs) {
            openaiWs.close();
        }
    };

    socket.onerror = (error) => {
        console.error('Client WebSocket error:', error);
    };

    return response;
}
