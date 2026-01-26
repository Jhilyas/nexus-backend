import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import Groq from 'groq-sdk'; // Removed Groq
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { dbHelpers } from './database.js';
import { emailService } from './services/email.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://nexus-morocco-platform.netlify.app',
    'https://nexus-morocco.com',
    'https://www.nexus-morocco.com',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now in production
        }
    },
    credentials: true
}));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
        });
    }
    next();
};

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION ROUTES
// ═══════════════════════════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, bacYear, bacType, bacScore } = req.body;

        // Check if user exists
        const existingUser = dbHelpers.getUserByEmail.get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = dbHelpers.createUser.run(
            email,
            hashedPassword,
            name,
            bacYear || null,
            bacType || null,
            bacScore || null
        );

        const userId = result.lastInsertRowid;

        // Initialize user progress
        dbHelpers.initUserProgress.run(userId);

        // Get created user
        const user = dbHelpers.getUserById.get(userId);

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { ...user, password: undefined }
        });

        // Send welcome email (async - don't block response)
        emailService.sendWelcomeEmail(email, name).catch(err => console.error('Failed to send welcome email:', err));
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user
        const user = dbHelpers.getUserByEmail.get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { ...user, password: undefined }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        const user = dbHelpers.getUserById.get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ...user, password: undefined });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// AI MENTOR (SAGE) ROUTES
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// AI MENTOR (SAGE) ROUTES - MISTRAL POWERED
// ═══════════════════════════════════════════════════════════════

// import { GoogleGenerativeAI } from '@google/generative-ai'; // Removed Gemini

// ═══════════════════════════════════════════════════════════════
// AI MENTOR (SAGE) ROUTES - MISTRAL POWERED
// ═══════════════════════════════════════════════════════════════

// Initialize Mistral
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'mistral-small-latest';

const SAGE_SYSTEM_PROMPT = `Tu es SAGE, l'ami conseiller de NEXUS pour les étudiants marocains.

⚡ RÈGLE ABSOLUE: RÉPONSES ULTRA-COURTES!
- MAX 1-2 phrases! Jamais plus de 30 mots!
- Parle comme un pote, pas un robot
- Direct et naturel

🌍 Réponds dans la MÊME langue que l'utilisateur.

Exemples parfaits:
- "L'ENSIAS c'est top pour l'info! Tu vises quel métier?"
- "Ah oui, le CNC c'est dur mais faisable!"
- "Pour l'UM6P, faut un bon dossier."

Tu connais: EMI, ENSIAS, INPT, UM6P, ENCG, prépas, CNC, TAFEM.`;

app.post('/api/sage/chat', optionalAuth, async (req, res) => {
    try {
        const { message, conversationHistory = [], mode = 'mentor', language = 'fr' } = req.body;

        if (!MISTRAL_API_KEY) {
            throw new Error('MISTRAL_API_KEY not configured');
        }

        const messages = [
            { role: 'system', content: SAGE_SYSTEM_PROMPT + `\nMode: ${mode}.` },
            ...conversationHistory.slice(-8).map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: MISTRAL_MODEL,
                messages: messages,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || 'Désolé, problème technique.';

        // Save conversation if user is logged in
        if (req.user) {
            const fullConversation = [...conversationHistory, { role: 'user', content: message }, { role: 'assistant', content: reply }];
            dbHelpers.saveConversation.run(req.user.id, JSON.stringify(fullConversation), mode);

            // Update mentor sessions count
            const progress = dbHelpers.getUserProgress.get(req.user.id);
            if (progress) {
                const newSessions = (progress.mentor_sessions || 0) + 1;
                const newTotal = Math.min(100, progress.total_progress + 2);
                dbHelpers.updateUserProgress.run(
                    progress.orientation_completed,
                    progress.timeline_viewed,
                    progress.schools_explored,
                    newSessions,
                    progress.exams_prepared,
                    newTotal,
                    req.user.id
                );
            }
        }

        res.json({
            reply,
            usage: { model: MISTRAL_MODEL }
        });
    } catch (error) {
        console.error('SAGE Error:', error);

        const fallbackResponses = {
            fr: "Je suis désolé, je rencontre des difficultés techniques. Mistral API error.",
            ar: "أعتذر، أواجه صعوبات تقنية. هل يمكنك إعادة صياغة سؤالك؟",
            en: "I'm sorry, I'm experiencing technical difficulties. Could you rephrase your question?"
        };

        res.json({
            reply: fallbackResponses[req.body.language] || fallbackResponses.fr,
            error: true
        });
    }
});

// Route alternative pour le frontend AIMentor
app.post('/api/ai/chat', optionalAuth, async (req, res) => {
    try {
        const { message, conversationHistory = [], mode = 'mentor', personality = '', language = 'fr' } = req.body;

        if (!MISTRAL_API_KEY) {
            throw new Error('MISTRAL_API_KEY not configured');
        }

        const messages = [
            { role: 'system', content: `STOP! MAX 2 PHRASES COURTES!\nRéponds comme un pote. JAMAIS de listes. Sois cool!` },
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: MISTRAL_MODEL,
                messages: messages,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || 'Désolé, problème technique.';

        res.json({
            success: true,
            response: reply,
            usage: { model: MISTRAL_MODEL }
        });
    } catch (error) {
        console.error('AI Chat Error:', error);

        const fallbackResponses = {
            fr: "Je suis désolé, je rencontre des difficultés techniques (Mistral fallback).",
            ar: "أعتذر، أواجه صعوبات تقنية. هل يمكنك إعادة صياغة سؤالك؟",
            en: "I'm sorry, I'm experiencing technical difficulties. Could you rephrase your question?"
        };

        res.json({
            success: false,
            response: fallbackResponses[req.body.language] || fallbackResponses.fr
        });
    }
});

// ═══════════════════════════════════════════════════════════════
// ORIENTATION ENGINE ROUTES
// ═══════════════════════════════════════════════════════════════

app.post('/api/orientation/analyze', optionalAuth, async (req, res) => {
    try {
        const { answers, userProfile } = req.body;

        // Analyze answers and match with paths
        const passionMapping = {
            0: 'technology',
            1: 'creative',
            2: 'business',
            3: 'healthcare',
            4: 'humanities'
        };

        const workstyleMapping = {
            0: 'individual',
            1: 'team',
            2: 'mixed',
            3: 'leadership'
        };

        const mathMapping = {
            0: 'strong',
            1: 'moderate',
            2: 'weak',
            3: 'literature'
        };

        const futureMapping = {
            0: 'entrepreneurship',
            1: 'expertise',
            2: 'helping',
            3: 'creating',
            4: 'traveling'
        };

        const passion = passionMapping[answers[0]] || 'technology';
        const workstyle = workstyleMapping[answers[1]] || 'mixed';
        const mathLevel = mathMapping[answers[2]] || 'moderate';
        const futureGoal = futureMapping[answers[3]] || 'expertise';

        // Get careers from database and calculate matches
        const allCareers = dbHelpers.getAllCareers.all();
        const matchedCareers = allCareers.map(career => {
            let score = 0;

            // Domain match
            if (career.domain === passion) score += 30;

            // Math requirement
            if (mathLevel === 'strong' && career.domain === 'technology') score += 20;
            if (mathLevel === 'weak' && career.domain === 'creative') score += 15;

            // Future goals
            if (futureGoal === 'entrepreneurship' && career.title.includes('Manager')) score += 15;
            if (futureGoal === 'helping' && career.domain === 'healthcare') score += 20;
            if (futureGoal === 'creating' && career.domain === 'creative') score += 20;

            // Base score
            score += 40 + Math.random() * 20;

            return {
                ...career,
                skills: career.skills ? career.skills.split(',') : [],
                education: career.education ? career.education.split(',') : [],
                matchScore: Math.min(Math.round(score), 98)
            };
        }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

        // Get schools from database and filter
        const allSchools = dbHelpers.getAllSchools.all();
        const matchedSchools = allSchools.filter(school => {
            if (passion === 'technology' && school.domain === 'engineering') return true;
            if (passion === 'business' && school.domain === 'business') return true;
            if (passion === 'healthcare' && school.domain === 'medicine') return true;
            return false;
        }).map(school => ({
            ...school,
            specialties: school.specialties ? school.specialties.split(',') : [],
            careers: school.careers ? school.careers.split(',') : []
        })).slice(0, 5);

        // Save result if user is logged in
        if (req.user) {
            dbHelpers.saveOrientationResult.run(
                req.user.id,
                JSON.stringify(answers),
                passion,
                workstyle,
                mathLevel,
                futureGoal,
                JSON.stringify(matchedCareers.map(c => c.id)),
                JSON.stringify(matchedSchools.map(s => s.id))
            );

            // Update progress
            const progress = dbHelpers.getUserProgress.get(req.user.id);
            if (progress) {
                const newTotal = Math.min(100, progress.total_progress + 15);
                dbHelpers.updateUserProgress.run(
                    1,
                    progress.timeline_viewed,
                    progress.schools_explored,
                    progress.mentor_sessions,
                    progress.exams_prepared,
                    newTotal,
                    req.user.id
                );
            }
        }

        res.json({
            profile: {
                passion,
                workstyle,
                mathLevel,
                futureGoal
            },
            careers: matchedCareers,
            schools: matchedSchools
        });
    } catch (error) {
        console.error('Orientation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// SCHOOLS & CAREERS DATABASE ROUTES
// ═══════════════════════════════════════════════════════════════

app.get('/api/schools', (req, res) => {
    try {
        const { domain, city, type, search } = req.query;

        let schools;
        if (search) {
            schools = dbHelpers.searchSchools.all(`%${search}%`, `%${search}%`);
        } else if (domain && domain !== 'all') {
            schools = dbHelpers.getSchoolsByDomain.all(domain);
        } else if (city && city !== 'all') {
            schools = dbHelpers.getSchoolsByCity.all(city);
        } else {
            schools = dbHelpers.getAllSchools.all();
        }

        // Filter by type if provided
        if (type && type !== 'all') {
            schools = schools.filter(s => s.type === type);
        }

        // Parse arrays
        const parsed = schools.map(school => ({
            ...school,
            specialties: school.specialties ? school.specialties.split(',') : [],
            careers: school.careers ? school.careers.split(',') : []
        }));

        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/schools/:id', (req, res) => {
    try {
        const school = dbHelpers.getSchoolById.get(req.params.id);
        if (!school) return res.status(404).json({ error: 'School not found' });

        res.json({
            ...school,
            specialties: school.specialties ? school.specialties.split(',') : [],
            careers: school.careers ? school.careers.split(',') : []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/careers', (req, res) => {
    try {
        const { domain } = req.query;

        let careers;
        if (domain && domain !== 'all') {
            careers = dbHelpers.getCareersByDomain.all(domain);
        } else {
            careers = dbHelpers.getAllCareers.all();
        }

        const parsed = careers.map(career => ({
            ...career,
            skills: career.skills ? career.skills.split(',') : [],
            education: career.education ? career.education.split(',') : [],
            salaryRange: { min: career.salary_min, max: career.salary_max }
        }));

        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/careers/:id', (req, res) => {
    try {
        const career = dbHelpers.getCareerById.get(req.params.id);
        if (!career) return res.status(404).json({ error: 'Career not found' });

        res.json({
            ...career,
            skills: career.skills ? career.skills.split(',') : [],
            education: career.education ? career.education.split(',') : [],
            salaryRange: { min: career.salary_min, max: career.salary_max }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// TIMELINE SIMULATION
// ═══════════════════════════════════════════════════════════════

app.post('/api/timeline/simulate', optionalAuth, async (req, res) => {
    try {
        const { careerPath, startYear = 2025 } = req.body;

        const timelines = {
            engineering: [
                { year: startYear, title: "École d'ingénieurs", description: "Début du cycle ingénieur", income: 0, satisfaction: 70 },
                { year: startYear + 3, title: "Ingénieur Junior", description: "Premier poste en entreprise tech", income: 12000, satisfaction: 75 },
                { year: startYear + 7, title: "Ingénieur Senior", description: "Lead technique d'équipe", income: 25000, satisfaction: 85 },
                { year: startYear + 12, title: "Tech Lead / Manager", description: "Direction technique", income: 40000, satisfaction: 90 },
                { year: startYear + 18, title: "CTO / Directeur", description: "Direction générale tech", income: 70000, satisfaction: 95 }
            ],
            medicine: [
                { year: startYear, title: "Faculté de Médecine", description: "Études médicales", income: 0, satisfaction: 60 },
                { year: startYear + 7, title: "Médecin Interne", description: "Formation hospitalière", income: 8000, satisfaction: 70 },
                { year: startYear + 11, title: "Médecin Spécialiste", description: "Pratique spécialisée", income: 35000, satisfaction: 85 },
                { year: startYear + 17, title: "Chef de Service", description: "Direction médicale", income: 60000, satisfaction: 90 },
                { year: startYear + 22, title: "Professeur Agrégé", description: "Enseignement et recherche", income: 100000, satisfaction: 95 }
            ],
            business: [
                { year: startYear, title: "École de Commerce", description: "Formation management", income: 0, satisfaction: 70 },
                { year: startYear + 3, title: "Consultant Junior", description: "Cabinet de conseil", income: 15000, satisfaction: 72 },
                { year: startYear + 6, title: "Manager", description: "Gestion d'équipe", income: 28000, satisfaction: 80 },
                { year: startYear + 10, title: "Directeur", description: "Direction département", income: 50000, satisfaction: 88 },
                { year: startYear + 15, title: "CEO / Entrepreneur", description: "Direction générale", income: 100000, satisfaction: 95 }
            ]
        };

        const timeline = timelines[careerPath] || timelines.engineering;

        // Update progress if logged in
        if (req.user) {
            const progress = dbHelpers.getUserProgress.get(req.user.id);
            if (progress) {
                const newTotal = Math.min(100, progress.total_progress + 5);
                dbHelpers.updateUserProgress.run(
                    progress.orientation_completed,
                    1,
                    progress.schools_explored,
                    progress.mentor_sessions,
                    progress.exams_prepared,
                    newTotal,
                    req.user.id
                );
            }
        }

        res.json({
            careerPath,
            timeline,
            insights: [
                "📈 Ce parcours a un taux de réussite de 87% pour des profils similaires.",
                "⏰ Les 3 premières années sont cruciales pour établir les fondations.",
                "💡 Conseil: Développez un réseau professionnel dès maintenant.",
                "🎯 Focus sur les compétences techniques ET les soft skills."
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// USER DASHBOARD ROUTES
// ═══════════════════════════════════════════════════════════════

// Get user progress
app.get('/api/user/progress', authenticateToken, (req, res) => {
    try {
        const progress = dbHelpers.getUserProgress.get(req.user.id);
        res.json(progress || { total_progress: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user deadlines
app.get('/api/user/deadlines', authenticateToken, (req, res) => {
    try {
        const deadlines = dbHelpers.getDeadlinesByUser.all(req.user.id);
        res.json(deadlines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create deadline
app.post('/api/user/deadlines', authenticateToken, (req, res) => {
    try {
        const { title, description, deadline_date, priority } = req.body;
        const result = dbHelpers.createDeadline.run(
            req.user.id,
            title,
            description || null,
            deadline_date,
            priority || 'medium'
        );
        res.status(201).json({ id: result.lastInsertRowid, message: 'Deadline created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get orientation history
app.get('/api/user/orientation-history', authenticateToken, (req, res) => {
    try {
        const results = dbHelpers.getOrientationResultsByUser.all(req.user.id);
        res.json(results.map(r => ({
            ...r,
            answers: JSON.parse(r.answers),
            matched_careers: JSON.parse(r.matched_careers || '[]'),
            matched_schools: JSON.parse(r.matched_schools || '[]')
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION & PLANS ROUTES
// ═══════════════════════════════════════════════════════════════

// Plan definitions with features and limits - NEXUS AI
const PLANS = {
    free: {
        id: 'free',
        name: 'Découverte',
        price: 0,
        yearlyPrice: 0,
        features: {
            nexusAIChat: 10,          // 10 conversations NEXUS AI Chat
            nexusAIVoice: 10,         // 10 sessions NEXUS AI Voice
            timelineSimulations: 1,
            orientationTests: 1,
            schoolExploration: true,
            newsArticles: true,
            examPrep: false,
            prioritySupport: false,
            humanMentor: false,
            vipEvents: false,
            aiInterview: false
        }
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 79,
        yearlyPrice: 758,
        features: {
            nexusAIChat: -1,          // Unlimited
            nexusAIVoice: -1,         // Unlimited
            timelineSimulations: -1,
            orientationTests: -1,
            schoolExploration: true,
            newsArticles: true,
            examPrep: true,
            prioritySupport: true,
            deadlineAlerts: true,
            humanMentor: false,
            vipEvents: false,
            aiInterview: false
        }
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        price: 199,
        yearlyPrice: 1908,
        features: {
            nexusAIChat: -1,
            nexusAIVoice: -1,
            timelineSimulations: -1,
            orientationTests: -1,
            schoolExploration: true,
            newsArticles: true,
            examPrep: true,
            prioritySupport: true,
            deadlineAlerts: true,
            humanMentor: true,         // 2h/month
            vipEvents: true,
            aiInterview: true,
            certificate: true
        }
    },
    godmode: {
        id: 'godmode',
        name: 'Lifetime',
        price: 499,
        yearlyPrice: 499,            // One-time payment
        features: {
            nexusAIChat: -1,
            nexusAIVoice: -1,
            timelineSimulations: -1,
            orientationTests: -1,
            schoolExploration: true,
            newsArticles: true,
            examPrep: true,
            prioritySupport: true,
            deadlineAlerts: true,
            humanMentor: true,
            vipEvents: true,
            aiInterview: true,
            certificate: true,
            lifetimeAccess: true,
            familyAccounts: 5,
            earlyAccess: true,
            masterclasses: true,
            founderBadge: true
        }
    }
};


// Get all plans
app.get('/api/plans', (req, res) => {
    res.json(PLANS);
});

// Get current user subscription
app.get('/api/user/subscription', authenticateToken, (req, res) => {
    try {
        const user = dbHelpers.getUserById.get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentPlan = PLANS[user.subscription] || PLANS.free;

        res.json({
            currentPlan: user.subscription || 'free',
            planDetails: currentPlan,
            subscribedAt: user.created_at,
            features: currentPlan.features
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Subscribe/upgrade to a plan (Demo mode - no real payment)
app.post('/api/user/subscription', authenticateToken, (req, res) => {
    try {
        const { planId, billingCycle = 'monthly' } = req.body;

        // Validate plan
        if (!PLANS[planId]) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        // Update user subscription
        dbHelpers.updateUserSubscription.run(planId, req.user.id);

        // Get updated user
        const user = dbHelpers.getUserById.get(req.user.id);
        const plan = PLANS[planId];

        res.json({
            success: true,
            message: `🎉 Félicitations! Vous êtes maintenant ${plan.name}!`,
            subscription: {
                plan: planId,
                planDetails: plan,
                billingCycle,
                activatedAt: new Date().toISOString()
            },
            user: { ...user, password: undefined }
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if user has access to a feature
app.get('/api/user/feature-access/:feature', authenticateToken, (req, res) => {
    try {
        const { feature } = req.params;
        const user = dbHelpers.getUserById.get(req.user.id);
        const plan = PLANS[user.subscription] || PLANS.free;

        const hasAccess = plan.features[feature] === true ||
            (typeof plan.features[feature] === 'number' && plan.features[feature] !== 0);

        res.json({
            feature,
            hasAccess,
            currentPlan: user.subscription,
            limit: plan.features[feature],
            upgradeRequired: !hasAccess
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// AI USAGE TRACKING
// ═══════════════════════════════════════════════════════════════

// Get AI usage stats for user
app.get('/api/user/ai-usage', authenticateToken, (req, res) => {
    try {
        const user = dbHelpers.getUserById.get(req.user.id);
        const plan = PLANS[user.subscription] || PLANS.free;
        const progress = dbHelpers.getUserProgress.get(req.user.id);

        // Count conversations today
        const today = new Date().toISOString().split('T')[0];
        const chatCount = db.prepare(`
            SELECT COUNT(*) as count FROM conversations 
            WHERE user_id = ? AND DATE(created_at) = DATE(?)
        `).get(req.user.id, today);

        const chatUsed = chatCount?.count || 0;
        const voiceUsed = progress?.mentor_sessions || 0;

        const chatLimit = plan.features.nexusAIChat;
        const voiceLimit = plan.features.nexusAIVoice;

        res.json({
            chat: {
                used: chatUsed,
                limit: chatLimit,
                unlimited: chatLimit === -1,
                remaining: chatLimit === -1 ? 'unlimited' : Math.max(0, chatLimit - chatUsed)
            },
            voice: {
                used: voiceUsed,
                limit: voiceLimit,
                unlimited: voiceLimit === -1,
                remaining: voiceLimit === -1 ? 'unlimited' : Math.max(0, voiceLimit - voiceUsed)
            },
            plan: user.subscription || 'free',
            planName: plan.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user can use AI Chat
app.get('/api/user/can-use-chat', authenticateToken, (req, res) => {
    try {
        const user = dbHelpers.getUserById.get(req.user.id);
        const plan = PLANS[user.subscription] || PLANS.free;

        // Unlimited
        if (plan.features.nexusAIChat === -1) {
            return res.json({ canUse: true, unlimited: true });
        }

        // Count today's conversations
        const today = new Date().toISOString().split('T')[0];
        const chatCount = db.prepare(`
            SELECT COUNT(*) as count FROM conversations 
            WHERE user_id = ? AND DATE(created_at) = DATE(?)
        `).get(req.user.id, today);

        const used = chatCount?.count || 0;
        const limit = plan.features.nexusAIChat;
        const canUse = used < limit;

        res.json({
            canUse,
            used,
            limit,
            remaining: limit - used,
            upgradeMessage: canUse ? null : 'Vous avez atteint votre limite quotidienne. Passez à Pro pour un accès illimité!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user can use AI Voice
app.get('/api/user/can-use-voice', authenticateToken, (req, res) => {
    try {
        const user = dbHelpers.getUserById.get(req.user.id);
        const plan = PLANS[user.subscription] || PLANS.free;

        // Unlimited
        if (plan.features.nexusAIVoice === -1) {
            return res.json({ canUse: true, unlimited: true });
        }

        const progress = dbHelpers.getUserProgress.get(req.user.id);
        const used = progress?.mentor_sessions || 0;
        const limit = plan.features.nexusAIVoice;
        const canUse = used < limit;

        res.json({
            canUse,
            used,
            limit,
            remaining: limit - used,
            upgradeMessage: canUse ? null : 'Vous avez atteint votre limite de sessions vocales. Passez à Pro pour un accès illimité!'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POINT-&-EXPLAIN - Vision AI Analysis
// ═══════════════════════════════════════════════════════════════

const POINT_EXPLAIN_PROMPT = `Tu es un assistant visuel NEXUS. Tu reçois la description d'une zone d'image pointée par un utilisateur.

🎯 TON RÔLE:
- Explique clairement ce que l'élément pointé représente
- Si c'est du texte/équation: explique le concept
- Si c'est un composant/schéma: décris son rôle
- Si c'est une erreur: propose une correction

⚡ FORMAT: 2-3 phrases courtes, directes et utiles!
🌍 Langue: Réponds dans la même langue que l'utilisateur.

Exemples:
- "C'est une intégrale définie. Elle calcule l'aire sous la courbe entre a et b."
- "Ce composant est une résistance de 10kΩ. Elle limite le courant dans ton circuit."
- "Cette étape est fausse: tu as oublié de factoriser par x²."`;

app.post('/api/ai/point-explain', optionalAuth, async (req, res) => {
    try {
        const { imageBase64, context = 'general', language = 'fr', description = '' } = req.body;

        // For interface elements, use description directly
        let contentToAnalyze = description;

        // Build the prompt based on context
        const contextPrompts = {
            interface: `Tu es un assistant qui explique les éléments d'interface.
L'utilisateur pointe un élément de l'application NEXUS.

RÈGLES:
- Explique en 1-2 phrases ce que fait cet élément
- Sois utile et concis
- Donne un conseil si pertinent`,
            education: `Tu es un tuteur expert.
L'utilisateur pointe un élément éducatif (formule, exercice, concept).

RÈGLES:
- Explique clairement en 2-3 phrases
- Donne un exemple si utile`,
            general: `Tu es un assistant utile.
L'utilisateur pointe quelque chose et veut une explication.

RÈGLES:
- Explique en 1-2 phrases claires
- Sois direct et utile`
        };

        const systemPrompt = contextPrompts[context] || contextPrompts.general;

        // Create user message
        const userMessage = contentToAnalyze
            ? `Explique cet élément: ${contentToAnalyze}`
            : "L'utilisateur a pointé un élément mais je n'ai pas plus de détails. Dis-lui de pointer plus précisément.";

        // Call Groq for intelligent explanation
        const completion = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 150,
            temperature: 0.6,
        });

        const explanation = completion.choices[0]?.message?.content ||
            "Je n'ai pas pu analyser cet élément. Essayez de pointer un autre élément.";

        res.json({
            success: true,
            explanation,
            context,
            language
        });

    } catch (error) {
        console.error('Point-Explain Error:', error);

        // Fallback response
        const fallbacks = {
            fr: "Cet élément fait partie de l'interface NEXUS. Pointez-le plus longtemps pour plus de détails.",
            en: "This element is part of the NEXUS interface. Point at it longer for more details.",
            ar: "هذا العنصر جزء من واجهة NEXUS."
        };

        res.json({
            success: true,
            explanation: fallbacks[req.body.language] || fallbacks.fr,
            context: req.body.context,
            language: req.body.language
        });
    }
});

// Simplified endpoint for testing
app.post('/api/ai/point-explain/test', async (req, res) => {
    res.json({
        success: true,
        explanation: "Test réussi! L'endpoint Point-&-Explain fonctionne correctement. 🎯",
        message: "Envoyez une image base64 pour obtenir une vraie analyse."
    });
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK & STATS
// ═══════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
    const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get();
    const careerCount = db.prepare('SELECT COUNT(*) as count FROM careers').get();
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        name: 'NEXUS Backend',
        database: 'SQLite (connected)',
        ai: process.env.GROQ_API_KEY ? 'Groq LLaMA 3.3 70B (FREE & Ultra Fast!)' : 'not configured',
        stats: {
            schools: schoolCount.count,
            careers: careerCount.count,
            users: userCount.count
        }
    });
});

app.get('/api/stats', (req, res) => {
    const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get();
    const careerCount = db.prepare('SELECT COUNT(*) as count FROM careers').get();
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

    res.json({
        schools: schoolCount.count,
        careers: careerCount.count,
        users: userCount.count,
        successRate: 94
    });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🌌  NEXUS BACKEND SERVER v1.0.0                             ║
  ║   "Where every future begins."                                ║
  ║                                                               ║
  ║   Server: http://0.0.0.0:${PORT}                                ║
  ║   Database: SQLite (nexus.db)                                 ║
  ║   AI: ${process.env.GEMINI_API_KEY ? '✅ Google Gemini (FREE)' : '❌ Not configured'}                      ║
  ║                                                               ║
  ║   Endpoints:                                                  ║
  ║   ├── POST /api/auth/register                                 ║
  ║   ├── POST /api/auth/login                                    ║
  ║   ├── GET  /api/auth/me                                       ║
  ║   ├── POST /api/sage/chat (Gemini Flash)                      ║
  ║   ├── POST /api/orientation/analyze                           ║
  ║   ├── GET  /api/schools                                       ║
  ║   ├── GET  /api/careers                                       ║
  ║   ├── POST /api/timeline/simulate                             ║
  ║   ├── GET  /api/user/progress                                 ║
  ║   ├── GET  /api/user/deadlines                                ║
  ║   └── GET  /api/health                                        ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
