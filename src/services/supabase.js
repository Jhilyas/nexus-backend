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
// AI CHAT (Via Supabase Edge Function)
// ═══════════════════════════════════════════════════════════════

export const ai = {
    async chat(message, conversationHistory = [], mode = 'mentor', language = 'fr') {
        try {
            // Call Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('ai-chat', {
                body: {
                    message,
                    conversationHistory,
                    mode,
                    language
                }
            });

            if (error) throw error;

            return {
                success: data.success,
                response: data.response
            };
        } catch (error) {
            console.error('AI Chat Error:', error);

            // Fallback responses
            const fallbackResponses = {
                fr: "Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler ?",
                ar: "أعتذر، أواجه صعوبات تقنية. هل يمكنك إعادة صياغة سؤالك؟",
                en: "Sorry, I'm experiencing technical difficulties. Could you rephrase?"
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
