// ═══════════════════════════════════════════════════════════════
// NEXUS - SUPABASE CLIENT CONFIGURATION
// Full Supabase Backend (Auth + Database + Edge Functions)
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not configured. Some features may not work.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION HELPERS (Using Supabase Auth)
// ═══════════════════════════════════════════════════════════════

export const auth = {
    // Sign up with email/password
    async signUp(email, password, name) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) throw error;
        return data;
    },

    // Sign in with email/password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Get session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    // Listen to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// ═══════════════════════════════════════════════════════════════
// DATABASE HELPERS (Direct Supabase Queries)
// ═══════════════════════════════════════════════════════════════

export const db = {
    // Schools
    async getSchools(filters = {}) {
        let query = supabase.from('schools').select('*');

        if (filters.domain && filters.domain !== 'all') {
            query = query.eq('domain', filters.domain);
        }
        if (filters.city && filters.city !== 'all') {
            query = query.eq('city', filters.city);
        }
        if (filters.type && filters.type !== 'all') {
            query = query.eq('type', filters.type);
        }
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getSchoolById(id) {
        const { data, error } = await supabase
            .from('schools')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // Careers
    async getCareers(filters = {}) {
        let query = supabase.from('careers').select('*');

        if (filters.domain && filters.domain !== 'all') {
            query = query.eq('domain', filters.domain);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(career => ({
            ...career,
            salaryRange: { min: career.salary_min, max: career.salary_max }
        }));
    },

    async getCareerById(id) {
        const { data, error } = await supabase
            .from('careers')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return {
            ...data,
            salaryRange: { min: data.salary_min, max: data.salary_max }
        };
    },

    // User Profile
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Subscription management
    async getSubscription(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('subscription')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data?.subscription || 'free';
    },

    async updateSubscription(userId, planId) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ subscription: planId, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // User Progress
    async getProgress(userId) {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async updateProgress(userId, updates) {
        const { data, error } = await supabase
            .from('user_progress')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // Orientation Results
    async saveOrientationResult(userId, result) {
        const { data, error } = await supabase
            .from('orientation_results')
            .insert({
                user_id: userId,
                ...result
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getOrientationHistory(userId) {
        const { data, error } = await supabase
            .from('orientation_results')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // Conversations
    async saveConversation(userId, messages, mode = 'mentor') {
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: userId,
                messages,
                mode
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getConversations(userId) {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data;
    }
};

// ═══════════════════════════════════════════════════════════════
// AI CHAT (Via Groq LLaMA 3.3 - FREE & ULTRA FAST!)
// ═══════════════════════════════════════════════════════════════

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SAGE_SYSTEM_PROMPT = `Tu es SAGE, assistant IA de NEXUS pour l'orientation au Maroc.

RÈGLE ABSOLUE: Maximum 2 phrases courtes par réponse. Pas plus!

Tes connaissances: écoles (ENSIAS, EMI, INPT, ENCG, ENSAM, UM6P), concours (CNC, TAFEM), carrières au Maroc.

Exemples de bonnes réponses:
- "L'ENSIAS est top pour l'informatique! Tu as quel niveau en maths?"
- "Le CNC demande 2 ans de prépa. Je te conseille de bien bosser la physique 💪"

Réponds dans la langue de l'utilisateur. Sois bref et utile!`;

const MODE_PROMPTS = {
    mentor: 'Sois professionnel et sage.',
    friend: 'Sois décontracté et amical.',
    motivator: 'Sois motivant et énergique!',
    calm: 'Sois calme et rassurant.'
};

export const ai = {
    async chat(message, conversationHistory = [], mode = 'mentor', language = 'fr') {
        try {
            console.log('🧠 NEXUS AI: Using Groq LLaMA 3.3 (FREE!)');

            const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.mentor;
            const systemInstruction = `${SAGE_SYSTEM_PROMPT}\n\nMode: ${modePrompt}`;

            const messages = [
                { role: 'system', content: systemInstruction },
                ...conversationHistory.slice(-6).map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                })),
                { role: 'user', content: message }
            ];

            // Call Groq API - FREE & ULTRA FAST!
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Groq API Error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0]?.message?.content;

            console.log('✅ Groq Response:', reply);

            return {
                success: true,
                response: reply
            };
        } catch (error) {
            console.error('AI Chat Error:', error);

            const fallbackResponses = {
                fr: "Désolé, petite erreur technique. Réessaie! 🔄",
                ar: "عذراً، خطأ تقني بسيط. حاول مرة أخرى! 🔄",
                en: "Sorry, small technical error. Try again! 🔄"
            };

            return {
                success: false,
                response: fallbackResponses[language] || fallbackResponses.fr
            };
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════

export const stats = {
    async getStats() {
        const [schools, careers] = await Promise.all([
            supabase.from('schools').select('id', { count: 'exact', head: true }),
            supabase.from('careers').select('id', { count: 'exact', head: true })
        ]);

        return {
            schools: schools.count || 0,
            careers: careers.count || 0,
            successRate: 94
        };
    }
};

export default supabase;
