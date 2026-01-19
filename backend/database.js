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
    // ═══════════════════════════════════════════════════════════════
    // FRANCE - ÉCOLES D'INGÉNIEURS POST-BAC
    // ═══════════════════════════════════════════════════════════════
    ['INSA Lyon', 'Institut National des Sciences Appliquées de Lyon', 'Villeurbanne, France', 'public', 'engineering', 'Génie Civil,Génie Électrique,Informatique,Génie Mécanique,Biosciences,Génie Énergétique', 'Concours Commun INSA (post-bac)', 16.0, 5, 'Diplôme d\'Ingénieur (grade Master, accrédité CTI)', 'Ingénieur R&D,Chef de Projet,Consultant,Directeur Technique', '🏫', '#667eea'],
    ['UTC', 'Université de Technologie de Compiègne', 'Compiègne, France', 'public', 'engineering', 'Génie Biologique,Informatique,Génie Mécanique,Génie des Procédés,Génie Urbain', 'Parcoursup / Groupe UT (dossier + entretien)', 15.5, 5, 'Diplôme d\'Ingénieur (grade Master, accrédité CTI)', 'Ingénieur Informatique,Ingénieur Procédés,Chef de Projet Industriel,Consultant', '🔧', '#10b981'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES D'INGÉNIEURS POST-BAC
    // ═══════════════════════════════════════════════════════════════
    ['ENSAM Casablanca', 'École Nationale Supérieure d\'Arts et Métiers de Casablanca', 'Casablanca, Maroc', 'public', 'engineering', 'Génie Mécanique,Systèmes Industriels,Automatique,Productique', 'Concours National (post-bac marocain)', 15.0, 5, 'Diplôme d\'Ingénieur (reconnu État marocain, habilité CTI)', 'Ingénieur Mécanique,Ingénieur Production,Chef d\'Atelier,Consultant Industrie', '⚙️', '#f97316'],
    ['Mines Rabat', 'École Nationale Supérieure des Mines de Rabat', 'Rabat, Maroc', 'public', 'engineering', 'Ingénierie Minière,Énergie,Environnement,Génie Industriel', 'Concours National Commun CNC (après CPGE)', 17.0, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Mines,Ingénieur Énergie,Chef de Projet,Directeur Industriel', '⛏️', '#f59e0b'],

    // ═══════════════════════════════════════════════════════════════
    // FRANCE - ÉCOLES DE COMMERCE POST-BAC
    // ═══════════════════════════════════════════════════════════════
    ['EM Normandie', 'EM Normandie Business School', 'Caen/Le Havre/Paris, France', 'private', 'business', 'Management,Marketing,Finance,International Business,Entrepreneuriat', 'Concours Sésame / Tests EMN (post-bac)', 13.0, 5, 'Master Grande École (visé par l\'État, grade Master)', 'Manager,Consultant,Entrepreneur,Directeur Marketing,Analyste Financier', '🎓', '#8b5cf6'],

    // ═══════════════════════════════════════════════════════════════
    // INTERNATIONAL - UNIVERSITÉS
    // ═══════════════════════════════════════════════════════════════
    ['MIT', 'Massachusetts Institute of Technology', 'Cambridge, Massachusetts, USA', 'private', 'engineering', 'Computer Science,Engineering,Physics,Mathematics,Economics,Biology', 'Application sélective (SAT/ACT + TOEFL/IELTS)', 18.0, 4, 'Bachelor of Science (accrédité NEASC)', 'Software Engineer,Research Scientist,Entrepreneur,Professor,CEO Tech', '🏛️', '#a31f34'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - UNIVERSITÉS PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    ['UM5', 'Université Mohammed V de Rabat', 'Rabat, Maroc', 'public', 'university', 'Droit,Sciences,Médecine,Ingénierie,Lettres,Économie', 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', 'Fonctionnaire,Cadre d\'Entreprise,Enseignant,Chercheur,Ingénieur', '🎓', '#1e3a5f'],
    ['Hassan II', 'Université Hassan II de Casablanca', 'Casablanca/Mohammedia, Maroc', 'public', 'university', 'Sciences,Lettres,Économie,Ingénierie,Médecine', 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', 'Cadre,Enseignant,Chercheur,Manager,Ingénieur', '📚', '#0d4c92'],
    ['UCA', 'Université Cadi Ayyad de Marrakech', 'Marrakech, Maroc', 'public', 'university', 'Sciences,Lettres,Ingénierie,Médecine,Arts', 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', 'Enseignant,Chercheur,Cadre,Médecin,Ingénieur', '🏫', '#c41e3a'],
    ['UIZ', 'Université Ibn Zohr d\'Agadir', 'Agadir, Maroc', 'public', 'university', 'Sciences,Ingénierie,Tourisme,Gestion,Lettres', 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', 'Manager Tourisme,Ingénieur,Enseignant,Cadre,Entrepreneur', '🌴', '#2e8b57'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - GRANDES ÉCOLES D'INGÉNIEURS PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    ['EMI', 'École Mohammadia d\'Ingénieurs', 'Rabat, Maroc', 'public', 'engineering', 'Génie Civil,Génie Électrique,Mécanique,Informatique Industrielle', 'Concours National Commun CNC (après CPGE)', 17.0, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Civil,Ingénieur Industriel,Chef de Projet,Consultant', '🏗️', '#f59e0b'],
    ['ENSIAS', 'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes', 'Rabat, Maroc', 'public', 'engineering', 'Informatique,Génie Logiciel,Data Science,Cybersécurité,IA', 'Concours National Commun CNC (après CPGE)', 16.5, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Logiciel,Data Scientist,Architecte SI,Tech Lead', '💻', '#667eea'],
    ['EHTP', 'École Hassania des Travaux Publics', 'Casablanca, Maroc', 'public', 'engineering', 'Génie Civil,Télécommunications,Informatique,Hydraulique', 'Concours National Commun CNC (après CPGE)', 16.3, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Civil,Ingénieur Télécom,Urbaniste', '🏛️', '#0ea5e9'],
    ['ECC', 'École Centrale Casablanca', 'Casablanca, Maroc', 'public', 'engineering', 'Ingénierie Généraliste,Électrique,Mécanique,Informatique', 'Concours CNC (après CPGE)', 16.5, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Généraliste,Chef de Projet,Consultant,Entrepreneur', '⚡', '#ff6b35'],
    ['INSEA', 'Institut National de Statistique et d\'Économie Appliquée', 'Rabat, Maroc', 'public', 'engineering', 'Statistique,Économie Appliquée,Actuariat,Data Science', 'Concours (après CPGE)', 16.0, 3, 'Diplôme d\'Ingénieur Statisticien-Économiste', 'Statisticien,Actuaire,Data Analyst,Économiste', '📊', '#6b5b95'],
    ['INPT', 'Institut National des Postes et Télécommunications', 'Rabat, Maroc', 'public', 'engineering', 'Télécommunications,Réseaux,IoT,Cloud Computing,Cybersécurité', 'Concours National Commun CNC (après CPGE)', 16.8, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Réseau,Ingénieur Télécom,DevOps,Expert Sécurité', '📡', '#10b981'],
    ['ENSA', 'Écoles Nationales des Sciences Appliquées', 'Plusieurs villes, Maroc', 'public', 'engineering', 'Génie Civil,Informatique,Électrique,Mécanique,Procédés', 'Concours post-bac CNC', 15.0, 5, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur,Chef de Projet,Consultant,Entrepreneur', '🔬', '#4a90d9'],
    ['ENSAM Rabat', 'École Nationale Supérieure des Arts et Métiers de Rabat', 'Rabat, Maroc', 'public', 'engineering', 'Génie Mécanique,Systèmes Embarqués,Automatique', 'Concours CNC (après CPGE)', 16.2, 3, 'Diplôme d\'Ingénieur d\'État', 'Ingénieur Mécanique,Ingénieur Automatique,Chef de Production', '⚙️', '#f97316'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES DE COMMERCE PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    ['ENCG', 'Écoles Nationales de Commerce et de Gestion', 'Plusieurs villes, Maroc', 'public', 'business', 'Marketing,Finance,Management,Gestion,Commerce International', 'Concours TAGEM (post-bac)', 14.0, 5, 'Diplôme ENCG (Master Spécialisé)', 'Manager,Analyste Financier,Consultant,Directeur Commercial', '📈', '#8b5cf6'],
    ['ISCAE', 'Institut Supérieur de Commerce et d\'Administration des Entreprises', 'Casablanca/Rabat, Maroc', 'public', 'business', 'Administration des Entreprises,Finance,Audit,Marketing', 'Concours ISCAE', 15.0, 5, 'Diplôme Grande École', 'Manager,Auditeur,Analyste Financier,Entrepreneur', '💼', '#7c3aed'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - UNIVERSITÉS ET ÉCOLES PRIVÉES
    // ═══════════════════════════════════════════════════════════════
    ['AUI', 'Al Akhawayn University in Ifrane', 'Ifrane, Maroc', 'private', 'university', 'Économie,Relations Internationales,Ingénierie,Droit,Sciences Sociales', 'Dossier + TOEFL/IELTS obligatoire', 14.0, 4, 'Bachelor / Master (accréditation américaine)', 'Manager International,Diplomate,Ingénieur,Consultant,Entrepreneur', '🏔️', '#003366'],
    ['UIR', 'Université Internationale de Rabat', 'Salé, Maroc', 'private', 'university', 'Ingénierie,Gestion,Droit,Architecture,Santé,IA', 'Concours sélectif UIR', 14.0, 5, 'Diplômes LMD / Ingénieur', 'Ingénieur,Architecte,Manager,Médecin,Juriste', '🌐', '#1e90ff'],
    ['UEMF', 'Université Euro-Méditerranéenne de Fès', 'Fès, Maroc', 'private', 'university', 'Ingénierie,Management,Santé,Sciences Politiques', 'Dossier + Entretien', 14.0, 5, 'Diplômes LMD (accréditation internationale)', 'Ingénieur,Manager,Médecin,Diplomate', '🌍', '#ff8c00'],
    ['UM6P', 'Université Mohammed VI Polytechnique', 'Ben Guerir, Maroc', 'private', 'engineering', 'Sciences Naturelles,Ingénierie,Agronomie,IA,Matériaux Avancés', 'Dossier + Sélection', 15.5, 5, 'Diplômes LMD / Ingénieur', 'Chercheur,Ingénieur,Entrepreneur,Data Scientist,Agronome', '🔬', '#06b6d4'],
    ['Mundiapolis', 'Université Mundiapolis de Casablanca', 'Casablanca, Maroc', 'private', 'university', 'Commerce,Droit,Ingénierie,Architecture,Design', 'Dossier', 12.0, 5, 'Diplômes LMD', 'Juriste,Manager,Ingénieur,Architecte,Designer', '🎨', '#9b59b6'],
    ['HEM', 'Hautes Études de Management', 'Plusieurs villes, Maroc', 'private', 'business', 'Business Administration,Entrepreneuriat,Marketing,Finance', 'Concours HEM', 13.0, 5, 'Bachelor / Master (accrédité)', 'Entrepreneur,CEO,Consultant,Manager,Directeur', '🎓', '#ec4899'],

    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES SPÉCIALISÉES
    // ═══════════════════════════════════════════════════════════════
    ['ENA Rabat', 'École Nationale d\'Architecture de Rabat', 'Rabat, Maroc', 'public', 'arts', 'Architecture,Design Urbain,Patrimoine,Paysage', 'Concours post-bac (option Sciences)', 14.0, 6, 'Diplôme d\'État d\'Architecte', 'Architecte,Urbaniste,Designer,Chef de Projet', '🏠', '#2ecc71'],
    ['ENS', 'Écoles Normales Supérieures', 'Rabat/Fès, Maroc', 'public', 'education', 'Formation des Professeurs,Agrégation,Pédagogie', 'Concours post-bac', 14.0, 5, 'Master en Éducation / Agrégation', 'Professeur du Secondaire,Formateur,Inspecteur', '📖', '#3498db']
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
