import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const db = new Database(path.join(__dirname, 'nexus.db'));
db.pragma('journal_mode = WAL');

// ═══════════════════════════════════════════════════════════════
// CREATE TABLES
// ═══════════════════════════════════════════════════════════════

db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    bac_year INTEGER,
    bac_type TEXT,
    bac_score REAL,
    subscription TEXT DEFAULT 'free',
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Schools table
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL,
    domain TEXT NOT NULL,
    specialties TEXT,
    admission_method TEXT,
    average_score REAL,
    duration INTEGER,
    diploma TEXT,
    careers TEXT,
    website TEXT,
    logo TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Careers table
  CREATE TABLE IF NOT EXISTS careers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    title_fr TEXT,
    title_ar TEXT,
    domain TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    growth INTEGER,
    skills TEXT,
    education TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Orientation Results table
  CREATE TABLE IF NOT EXISTS orientation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    answers TEXT NOT NULL,
    passion TEXT,
    workstyle TEXT,
    math_level TEXT,
    future_goal TEXT,
    matched_careers TEXT,
    matched_schools TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Conversations table
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    messages TEXT NOT NULL,
    mode TEXT DEFAULT 'mentor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Deadlines table
  CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    deadline_date DATE NOT NULL,
    priority TEXT DEFAULT 'medium',
    completed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- User Progress table
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    orientation_completed INTEGER DEFAULT 0,
    timeline_viewed INTEGER DEFAULT 0,
    schools_explored INTEGER DEFAULT 0,
    mentor_sessions INTEGER DEFAULT 0,
    exams_prepared INTEGER DEFAULT 0,
    total_progress INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ═══════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════

// Check if schools table is empty
const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get();
if (schoolCount.count === 0) {
    const insertSchool = db.prepare(`
    INSERT INTO schools (name, full_name, city, type, domain, specialties, admission_method, average_score, duration, diploma, careers, logo, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const schools = [
        ['ENSIAS', 'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes', 'Rabat', 'public', 'engineering', 'Computer Science,Data Science,Cybersecurity,Software Engineering', 'Concours National Commun', 16.5, 3, 'Ingénieur d\'État', 'Software Engineer,Data Scientist,Security Analyst,Tech Lead', '🖥️', '#667eea'],
        ['EMI', 'École Mohammadia d\'Ingénieurs', 'Rabat', 'public', 'engineering', 'Civil Engineering,Industrial Engineering,Computer Science,Electrical', 'Concours National Commun', 17.0, 3, 'Ingénieur d\'État', 'Civil Engineer,Industrial Engineer,Project Manager,Consultant', '🏗️', '#f59e0b'],
        ['INPT', 'Institut National des Postes et Télécommunications', 'Rabat', 'public', 'engineering', 'Telecommunications,Network Engineering,IoT,Cloud Computing', 'Concours National Commun', 16.8, 3, 'Ingénieur d\'État', 'Network Engineer,Telecom Specialist,IoT Developer,DevOps', '📡', '#10b981'],
        ['ENCG Casablanca', 'École Nationale de Commerce et de Gestion', 'Casablanca', 'public', 'business', 'Marketing,Finance,Management,International Business', 'TAFEM', 14.0, 5, 'Diplôme Grande École', 'Marketing Manager,Financial Analyst,Business Consultant,CEO', '📊', '#8b5cf6'],
        ['FMP Rabat', 'Faculté de Médecine et de Pharmacie de Rabat', 'Rabat', 'public', 'medicine', 'General Medicine,Pharmacy,Dentistry,Specializations', 'Concours', 16.0, 7, 'Doctorat en Médecine', 'Doctor,Specialist,Surgeon,Pharmacist', '⚕️', '#ef4444'],
        ['ENSAM Meknès', 'École Nationale Supérieure des Arts et Métiers', 'Meknès', 'public', 'engineering', 'Mechanical Engineering,Industrial Engineering,Production,Energy', 'Concours National Commun', 16.2, 3, 'Ingénieur d\'État', 'Mechanical Engineer,Production Manager,Quality Engineer,R&D', '⚙️', '#f97316'],
        ['UM6P', 'Université Mohammed VI Polytechnique', 'Benguerir', 'private', 'engineering', 'Computer Science,Mining,Agriculture Tech,AI & Robotics', 'Dossier + Entretien', 15.5, 5, 'Ingénieur', 'Tech Lead,Research Scientist,Entrepreneur,AI Engineer', '🔬', '#06b6d4'],
        ['HEM', 'Hautes Études de Management', 'Casablanca', 'private', 'business', 'Business Administration,Entrepreneurship,Marketing,Finance', 'Concours HEM', 13.0, 5, 'Master Grande École', 'Entrepreneur,CEO,Consultant,Manager', '🎓', '#ec4899'],
        ['EHTP', 'École Hassania des Travaux Publics', 'Casablanca', 'public', 'engineering', 'Civil Engineering,Hydraulics,Urban Planning,Environmental', 'Concours National Commun', 16.3, 3, 'Ingénieur d\'État', 'Civil Engineer,Urban Planner,Environmental Engineer', '🏛️', '#0ea5e9'],
        ['ISCAE', 'Institut Supérieur de Commerce et d\'Administration des Entreprises', 'Casablanca', 'public', 'business', 'Business Administration,Finance,Audit,Marketing', 'Concours ISCAE', 15.0, 5, 'Diplôme Grande École', 'Manager,Auditor,Financial Analyst,Entrepreneur', '💼', '#7c3aed']
    ];

    const insertMany = db.transaction((schools) => {
        for (const school of schools) {
            insertSchool.run(...school);
        }
    });
    insertMany(schools);
    console.log('✅ Schools seeded successfully');
}

// Check if careers table is empty
const careerCount = db.prepare('SELECT COUNT(*) as count FROM careers').get();
if (careerCount.count === 0) {
    const insertCareer = db.prepare(`
    INSERT INTO careers (title, title_fr, title_ar, domain, salary_min, salary_max, growth, skills, education, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const careers = [
        ['Software Engineer', 'Ingénieur Logiciel', 'مهندس برمجيات', 'technology', 12000, 35000, 340, 'JavaScript,Python,System Design,Problem Solving', 'Computer Science,Software Engineering', 'Design, develop, and maintain software applications and systems.'],
        ['Data Scientist', 'Data Scientist', 'عالم بيانات', 'technology', 15000, 45000, 280, 'Python,Machine Learning,Statistics,SQL', 'Data Science,Statistics,Computer Science', 'Analyze and interpret complex data to help organizations make decisions.'],
        ['Doctor (General)', 'Médecin Généraliste', 'طبيب عام', 'healthcare', 15000, 80000, 150, 'Diagnosis,Patient Care,Medical Knowledge,Communication', 'Medicine', 'Diagnose and treat patients for various medical conditions.'],
        ['Marketing Manager', 'Directeur Marketing', 'مدير التسويق', 'business', 18000, 50000, 180, 'Strategy,Digital Marketing,Analytics,Leadership', 'Marketing,Business Administration', 'Plan and execute marketing strategies to promote products or services.'],
        ['UX/UI Designer', 'Designer UX/UI', 'مصمم واجهات', 'creative', 10000, 30000, 220, 'Figma,User Research,Prototyping,Visual Design', 'Design,HCI,Computer Science', 'Create intuitive and visually appealing user interfaces.'],
        ['Civil Engineer', 'Ingénieur Civil', 'مهندس مدني', 'engineering', 12000, 40000, 120, 'AutoCAD,Structural Analysis,Project Management,Construction', 'Civil Engineering', 'Design and oversee construction of infrastructure projects.'],
        ['Financial Analyst', 'Analyste Financier', 'محلل مالي', 'business', 14000, 45000, 160, 'Excel,Financial Modeling,Valuation,Reporting', 'Finance,Economics', 'Analyze financial data and provide investment recommendations.'],
        ['AI/ML Engineer', 'Ingénieur IA/ML', 'مهندس ذكاء اصطناعي', 'technology', 18000, 60000, 400, 'Python,TensorFlow,PyTorch,Deep Learning', 'Computer Science,AI', 'Build and deploy artificial intelligence and machine learning systems.']
    ];

    const insertMany = db.transaction((careers) => {
        for (const career of careers) {
            insertCareer.run(...career);
        }
    });
    insertMany(careers);
    console.log('✅ Careers seeded successfully');
}

// ═══════════════════════════════════════════════════════════════
// DATABASE HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const dbHelpers = {
    // Users
    createUser: db.prepare(`
    INSERT INTO users (email, password, name, bac_year, bac_type, bac_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

    getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
    updateUser: db.prepare(`
    UPDATE users SET name = ?, bac_year = ?, bac_type = ?, bac_score = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
    updateUserSubscription: db.prepare('UPDATE users SET subscription = ? WHERE id = ?'),

    // Schools
    getAllSchools: db.prepare('SELECT * FROM schools'),
    getSchoolsByDomain: db.prepare('SELECT * FROM schools WHERE domain = ?'),
    getSchoolsByCity: db.prepare('SELECT * FROM schools WHERE city = ?'),
    getSchoolById: db.prepare('SELECT * FROM schools WHERE id = ?'),
    searchSchools: db.prepare('SELECT * FROM schools WHERE name LIKE ? OR full_name LIKE ?'),

    // Careers
    getAllCareers: db.prepare('SELECT * FROM careers'),
    getCareersByDomain: db.prepare('SELECT * FROM careers WHERE domain = ?'),
    getCareerById: db.prepare('SELECT * FROM careers WHERE id = ?'),

    // Orientation Results
    saveOrientationResult: db.prepare(`
    INSERT INTO orientation_results (user_id, answers, passion, workstyle, math_level, future_goal, matched_careers, matched_schools)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
    getOrientationResultsByUser: db.prepare('SELECT * FROM orientation_results WHERE user_id = ? ORDER BY created_at DESC'),

    // Conversations
    saveConversation: db.prepare(`
    INSERT INTO conversations (user_id, messages, mode) VALUES (?, ?, ?)
  `),
    updateConversation: db.prepare(`
    UPDATE conversations SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `),
    getConversationsByUser: db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC'),

    // Deadlines
    createDeadline: db.prepare(`
    INSERT INTO deadlines (user_id, title, description, deadline_date, priority)
    VALUES (?, ?, ?, ?, ?)
  `),
    getDeadlinesByUser: db.prepare('SELECT * FROM deadlines WHERE user_id = ? ORDER BY deadline_date ASC'),
    updateDeadline: db.prepare('UPDATE deadlines SET completed = ? WHERE id = ?'),
    deleteDeadline: db.prepare('DELETE FROM deadlines WHERE id = ?'),

    // User Progress
    initUserProgress: db.prepare(`
    INSERT OR IGNORE INTO user_progress (user_id) VALUES (?)
  `),
    getUserProgress: db.prepare('SELECT * FROM user_progress WHERE user_id = ?'),
    updateUserProgress: db.prepare(`
    UPDATE user_progress SET 
      orientation_completed = ?,
      timeline_viewed = ?,
      schools_explored = ?,
      mentor_sessions = ?,
      exams_prepared = ?,
      total_progress = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `)
};

export default db;
