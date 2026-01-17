import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { dbHelpers } from './database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'https://nexus-morocco-platform.netlify.app',
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

const SAGE_SYSTEM_PROMPT = `You are SAGE, an AI mentor for NEXUS - the ultimate educational orientation platform in Morocco. 

Your role:
- Guide students in their post-baccalaureate educational journey
- Provide detailed information about schools, programs, and careers in Morocco
- Be supportive, knowledgeable, and encouraging
- Adapt your tone based on the mode: mentor (academic), friend (casual), motivator (inspiring), calm (reassuring)

Key information you know:
- Moroccan educational system (Classes Préparatoires, Grandes Écoles, Universités)
- Major schools: ENSIAS, EMI, INPT, ENCG, ENSAM, UM6P, HEM, EHTP, ISCAE, etc.
- Admission processes: CNC (Concours National Commun), TAFEM, Concours spécifiques
- Career paths and salary expectations in Morocco
- Scholarship opportunities and deadlines

Always respond in the same language the user writes in (French, Arabic, or English).
Be concise but helpful. Maximum 3-4 paragraphs per response.
Use emojis sparingly to make responses friendly.`;

app.post('/api/sage/chat', optionalAuth, async (req, res) => {
    try {
        const { message, conversationHistory = [], mode = 'mentor', language = 'fr' } = req.body;

        // Build the conversation
        const messages = [
            { role: 'system', content: SAGE_SYSTEM_PROMPT + `\nCurrent mode: ${mode}. Primary language: ${language}` },
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        });

        const reply = completion.choices[0].message.content;

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
            usage: completion.usage
        });
    } catch (error) {
        console.error('SAGE Error:', error);

        // Fallback response if API fails
        const fallbackResponses = {
            fr: "Je suis désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?",
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

        const modePrompts = {
            mentor: 'Tu es un mentor éducatif professionnel, sage et expérimenté. Tu donnes des conseils structurés et détaillés sur l\'orientation au Maroc.',
            friend: 'Tu es un ami proche et bienveillant. Tu parles de manière décontractée mais toujours utile. Tu utilises un langage familier.',
            motivator: 'Tu es un coach motivant et énergique! Tu encourages et inspires avec enthousiasme! Tu utilises beaucoup d\'énergie positive!',
            calm: 'Tu es calme, posé et rassurant. Tu aides à réduire le stress et l\'anxiété. Tu parles doucement et avec empathie.'
        };

        const systemPrompt = `Tu es SAGE, l'assistant IA de NEXUS, la plateforme d'orientation éducative au Maroc.

${modePrompts[mode] || modePrompts.mentor}

Tes connaissances:
- Système éducatif marocain (Classes Préparatoires, Grandes Écoles, Universités)
- Écoles: ENSIAS, EMI, INPT, ENCG, ENSAM, UM6P, HEM, EHTP, ISCAE, FST, UM5, etc.
- Concours: CNC, TAFEM, concours spécifiques
- Carrières et salaires au Maroc
- Bourses et aides financières

Règles:
- Réponds dans la même langue que l'utilisateur (français, arabe ou anglais)
- Sois concis: 2-3 paragraphes maximum
- Utilise des emojis avec modération pour être friendly
- Si tu ne sais pas, dis-le honnêtement`;

        // Build messages for OpenAI
        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-8).map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            max_tokens: 600,
            temperature: mode === 'calm' ? 0.5 : mode === 'motivator' ? 0.9 : 0.7
        });

        const reply = completion.choices[0].message.content;

        res.json({
            success: true,
            response: reply,
            usage: completion.usage
        });
    } catch (error) {
        console.error('AI Chat Error:', error);

        const fallbackResponses = {
            fr: "Je suis désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?",
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
        openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
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
  ║   OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}                                  ║
  ║                                                               ║
  ║   Endpoints:                                                  ║
  ║   ├── POST /api/auth/register                                 ║
  ║   ├── POST /api/auth/login                                    ║
  ║   ├── GET  /api/auth/me                                       ║
  ║   ├── POST /api/sage/chat (GPT-4)                             ║
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
