-- ═══════════════════════════════════════════════════════════════
-- NEXUS DATABASE SCHEMA FOR SUPABASE
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bac_year INTEGER,
    bac_type TEXT,
    bac_score REAL,
    subscription TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools table
CREATE TABLE IF NOT EXISTS public.schools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    city TEXT NOT NULL,
    type TEXT NOT NULL,
    domain TEXT NOT NULL,
    specialties TEXT[],
    admission_method TEXT,
    average_score REAL,
    duration INTEGER,
    diploma TEXT,
    careers TEXT[],
    website TEXT,
    logo TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Careers table
CREATE TABLE IF NOT EXISTS public.careers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_fr TEXT,
    title_ar TEXT,
    domain TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    growth INTEGER,
    skills TEXT[],
    education TEXT[],
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orientation Results table
CREATE TABLE IF NOT EXISTS public.orientation_results (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    answers JSONB NOT NULL,
    passion TEXT,
    workstyle TEXT,
    math_level TEXT,
    future_goal TEXT,
    matched_careers INTEGER[],
    matched_schools INTEGER[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    messages JSONB NOT NULL,
    mode TEXT DEFAULT 'mentor',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) UNIQUE,
    orientation_completed BOOLEAN DEFAULT FALSE,
    timeline_viewed BOOLEAN DEFAULT FALSE,
    schools_explored INTEGER DEFAULT 0,
    mentor_sessions INTEGER DEFAULT 0,
    exams_prepared INTEGER DEFAULT 0,
    total_progress INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orientation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Schools: Everyone can read
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);

-- Careers: Everyone can read
CREATE POLICY "Careers are viewable by everyone" ON public.careers FOR SELECT USING (true);

-- Orientation Results: Users can CRUD their own
CREATE POLICY "Users can manage own orientation results" ON public.orientation_results FOR ALL USING (auth.uid() = user_id);

-- Conversations: Users can CRUD their own
CREATE POLICY "Users can manage own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);

-- User Progress: Users can CRUD their own
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA - SCHOOLS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.schools (name, full_name, city, type, domain, specialties, admission_method, average_score, duration, diploma, careers, logo, color) VALUES
-- ═══════════════════════════════════════════════════════════════
-- FRANCE - ÉCOLES D'INGÉNIEURS POST-BAC
-- ═══════════════════════════════════════════════════════════════
('INSA Lyon', 'Institut National des Sciences Appliquées de Lyon', 'Villeurbanne, France', 'public', 'engineering', ARRAY['Génie Civil', 'Génie Électrique', 'Informatique', 'Génie Mécanique', 'Biosciences', 'Génie Énergétique'], 'Concours Commun INSA (post-bac)', 16.0, 5, 'Diplôme d''Ingénieur (grade Master, accrédité CTI)', ARRAY['Ingénieur R&D', 'Chef de Projet', 'Consultant', 'Directeur Technique'], '🏫', '#667eea'),
('UTC', 'Université de Technologie de Compiègne', 'Compiègne, France', 'public', 'engineering', ARRAY['Génie Biologique', 'Informatique', 'Génie Mécanique', 'Génie des Procédés', 'Génie Urbain'], 'Parcoursup / Groupe UT (dossier + entretien)', 15.5, 5, 'Diplôme d''Ingénieur (grade Master, accrédité CTI)', ARRAY['Ingénieur Informatique', 'Ingénieur Procédés', 'Chef de Projet Industriel', 'Consultant'], '🔧', '#10b981'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - ÉCOLES D'INGÉNIEURS POST-BAC
-- ═══════════════════════════════════════════════════════════════
('ENSAM Casablanca', 'École Nationale Supérieure d''Arts et Métiers de Casablanca', 'Casablanca, Maroc', 'public', 'engineering', ARRAY['Génie Mécanique', 'Systèmes Industriels', 'Automatique', 'Productique'], 'Concours National (post-bac marocain)', 15.0, 5, 'Diplôme d''Ingénieur (reconnu État marocain, habilité CTI)', ARRAY['Ingénieur Mécanique', 'Ingénieur Production', 'Chef d''Atelier', 'Consultant Industrie'], '⚙️', '#f97316'),
('Mines Rabat', 'École Nationale Supérieure des Mines de Rabat', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Ingénierie Minière', 'Énergie', 'Environnement', 'Génie Industriel'], 'Concours National Commun CNC (après CPGE)', 17.0, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Mines', 'Ingénieur Énergie', 'Chef de Projet', 'Directeur Industriel'], '⛏️', '#f59e0b'),

-- ═══════════════════════════════════════════════════════════════
-- FRANCE - ÉCOLES DE COMMERCE POST-BAC
-- ═══════════════════════════════════════════════════════════════
('EM Normandie', 'EM Normandie Business School', 'Caen/Le Havre/Paris, France', 'private', 'business', ARRAY['Management', 'Marketing', 'Finance', 'International Business', 'Entrepreneuriat'], 'Concours Sésame / Tests EMN (post-bac)', 13.0, 5, 'Master Grande École (visé par l''État, grade Master)', ARRAY['Manager', 'Consultant', 'Entrepreneur', 'Directeur Marketing', 'Analyste Financier'], '🎓', '#8b5cf6'),

-- ═══════════════════════════════════════════════════════════════
-- INTERNATIONAL - UNIVERSITÉS
-- ═══════════════════════════════════════════════════════════════
('MIT', 'Massachusetts Institute of Technology', 'Cambridge, Massachusetts, USA', 'private', 'engineering', ARRAY['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Economics', 'Biology'], 'Application sélective (SAT/ACT + TOEFL/IELTS)', 18.0, 4, 'Bachelor of Science (accrédité NEASC)', ARRAY['Software Engineer', 'Research Scientist', 'Entrepreneur', 'Professor', 'CEO Tech'], '🏛️', '#a31f34'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - UNIVERSITÉS PUBLIQUES
-- ═══════════════════════════════════════════════════════════════
('UM5', 'Université Mohammed V de Rabat', 'Rabat, Maroc', 'public', 'university', ARRAY['Droit', 'Sciences', 'Médecine', 'Ingénierie', 'Lettres', 'Économie'], 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', ARRAY['Fonctionnaire', 'Cadre d''Entreprise', 'Enseignant', 'Chercheur', 'Ingénieur'], '🎓', '#1e3a5f'),
('Hassan II', 'Université Hassan II de Casablanca', 'Casablanca/Mohammedia, Maroc', 'public', 'university', ARRAY['Sciences', 'Lettres', 'Économie', 'Ingénierie', 'Médecine'], 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', ARRAY['Cadre', 'Enseignant', 'Chercheur', 'Manager', 'Ingénieur'], '📚', '#0d4c92'),
('UCA', 'Université Cadi Ayyad de Marrakech', 'Marrakech, Maroc', 'public', 'university', ARRAY['Sciences', 'Lettres', 'Ingénierie', 'Médecine', 'Arts'], 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', ARRAY['Enseignant', 'Chercheur', 'Cadre', 'Médecin', 'Ingénieur'], '🏫', '#c41e3a'),
('UIZ', 'Université Ibn Zohr d''Agadir', 'Agadir, Maroc', 'public', 'university', ARRAY['Sciences', 'Ingénierie', 'Tourisme', 'Gestion', 'Lettres'], 'Baccalauréat marocain', 12.0, 3, 'Licence / Master / Doctorat (système LMD)', ARRAY['Manager Tourisme', 'Ingénieur', 'Enseignant', 'Cadre', 'Entrepreneur'], '🌴', '#2e8b57'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - GRANDES ÉCOLES D'INGÉNIEURS PUBLIQUES
-- ═══════════════════════════════════════════════════════════════
('EMI', 'École Mohammadia d''Ingénieurs', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Génie Civil', 'Génie Électrique', 'Mécanique', 'Informatique Industrielle'], 'Concours National Commun CNC (après CPGE)', 17.0, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Civil', 'Ingénieur Industriel', 'Chef de Projet', 'Consultant'], '🏗️', '#f59e0b'),
('ENSIAS', 'École Nationale Supérieure d''Informatique et d''Analyse des Systèmes', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Informatique', 'Génie Logiciel', 'Data Science', 'Cybersécurité', 'IA'], 'Concours National Commun CNC (après CPGE)', 16.5, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Logiciel', 'Data Scientist', 'Architecte SI', 'Tech Lead'], '💻', '#667eea'),
('EHTP', 'École Hassania des Travaux Publics', 'Casablanca, Maroc', 'public', 'engineering', ARRAY['Génie Civil', 'Télécommunications', 'Informatique', 'Hydraulique'], 'Concours National Commun CNC (après CPGE)', 16.3, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Civil', 'Ingénieur Télécom', 'Urbaniste'], '🏛️', '#0ea5e9'),
('ECC', 'École Centrale Casablanca', 'Casablanca, Maroc', 'public', 'engineering', ARRAY['Ingénierie Généraliste', 'Électrique', 'Mécanique', 'Informatique'], 'Concours CNC (après CPGE)', 16.5, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Généraliste', 'Chef de Projet', 'Consultant', 'Entrepreneur'], '⚡', '#ff6b35'),
('INSEA', 'Institut National de Statistique et d''Économie Appliquée', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Statistique', 'Économie Appliquée', 'Actuariat', 'Data Science'], 'Concours (après CPGE)', 16.0, 3, 'Diplôme d''Ingénieur Statisticien-Économiste', ARRAY['Statisticien', 'Actuaire', 'Data Analyst', 'Économiste'], '📊', '#6b5b95'),
('INPT', 'Institut National des Postes et Télécommunications', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Télécommunications', 'Réseaux', 'IoT', 'Cloud Computing', 'Cybersécurité'], 'Concours National Commun CNC (après CPGE)', 16.8, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Réseau', 'Ingénieur Télécom', 'DevOps', 'Expert Sécurité'], '📡', '#10b981'),
('ENSA', 'Écoles Nationales des Sciences Appliquées', 'Plusieurs villes, Maroc', 'public', 'engineering', ARRAY['Génie Civil', 'Informatique', 'Électrique', 'Mécanique', 'Procédés'], 'Concours post-bac CNC', 15.0, 5, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur', 'Chef de Projet', 'Consultant', 'Entrepreneur'], '🔬', '#4a90d9'),
('ENSAM Rabat', 'École Nationale Supérieure des Arts et Métiers de Rabat', 'Rabat, Maroc', 'public', 'engineering', ARRAY['Génie Mécanique', 'Systèmes Embarqués', 'Automatique'], 'Concours CNC (après CPGE)', 16.2, 3, 'Diplôme d''Ingénieur d''État', ARRAY['Ingénieur Mécanique', 'Ingénieur Automatique', 'Chef de Production'], '⚙️', '#f97316'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - ÉCOLES DE COMMERCE PUBLIQUES
-- ═══════════════════════════════════════════════════════════════
('ENCG', 'Écoles Nationales de Commerce et de Gestion', 'Plusieurs villes, Maroc', 'public', 'business', ARRAY['Marketing', 'Finance', 'Management', 'Gestion', 'Commerce International'], 'Concours TAGEM (post-bac)', 14.0, 5, 'Diplôme ENCG (Master Spécialisé)', ARRAY['Manager', 'Analyste Financier', 'Consultant', 'Directeur Commercial'], '📈', '#8b5cf6'),
('ISCAE', 'Institut Supérieur de Commerce et d''Administration des Entreprises', 'Casablanca/Rabat, Maroc', 'public', 'business', ARRAY['Administration des Entreprises', 'Finance', 'Audit', 'Marketing'], 'Concours ISCAE', 15.0, 5, 'Diplôme Grande École', ARRAY['Manager', 'Auditeur', 'Analyste Financier', 'Entrepreneur'], '💼', '#7c3aed'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - UNIVERSITÉS ET ÉCOLES PRIVÉES
-- ═══════════════════════════════════════════════════════════════
('AUI', 'Al Akhawayn University in Ifrane', 'Ifrane, Maroc', 'private', 'university', ARRAY['Économie', 'Relations Internationales', 'Ingénierie', 'Droit', 'Sciences Sociales'], 'Dossier + TOEFL/IELTS obligatoire', 14.0, 4, 'Bachelor / Master (accréditation américaine)', ARRAY['Manager International', 'Diplomate', 'Ingénieur', 'Consultant', 'Entrepreneur'], '🏔️', '#003366'),
('UIR', 'Université Internationale de Rabat', 'Salé, Maroc', 'private', 'university', ARRAY['Ingénierie', 'Gestion', 'Droit', 'Architecture', 'Santé', 'IA'], 'Concours sélectif UIR', 14.0, 5, 'Diplômes LMD / Ingénieur', ARRAY['Ingénieur', 'Architecte', 'Manager', 'Médecin', 'Juriste'], '🌐', '#1e90ff'),
('UEMF', 'Université Euro-Méditerranéenne de Fès', 'Fès, Maroc', 'private', 'university', ARRAY['Ingénierie', 'Management', 'Santé', 'Sciences Politiques'], 'Dossier + Entretien', 14.0, 5, 'Diplômes LMD (accréditation internationale)', ARRAY['Ingénieur', 'Manager', 'Médecin', 'Diplomate'], '🌍', '#ff8c00'),
('UM6P', 'Université Mohammed VI Polytechnique', 'Ben Guerir, Maroc', 'private', 'engineering', ARRAY['Sciences Naturelles', 'Ingénierie', 'Agronomie', 'IA', 'Matériaux Avancés'], 'Dossier + Sélection', 15.5, 5, 'Diplômes LMD / Ingénieur', ARRAY['Chercheur', 'Ingénieur', 'Entrepreneur', 'Data Scientist', 'Agronome'], '🔬', '#06b6d4'),
('Mundiapolis', 'Université Mundiapolis de Casablanca', 'Casablanca, Maroc', 'private', 'university', ARRAY['Commerce', 'Droit', 'Ingénierie', 'Architecture', 'Design'], 'Dossier', 12.0, 5, 'Diplômes LMD', ARRAY['Juriste', 'Manager', 'Ingénieur', 'Architecte', 'Designer'], '🎨', '#9b59b6'),
('HEM', 'Hautes Études de Management', 'Plusieurs villes, Maroc', 'private', 'business', ARRAY['Business Administration', 'Entrepreneuriat', 'Marketing', 'Finance'], 'Concours HEM', 13.0, 5, 'Bachelor / Master (accrédité)', ARRAY['Entrepreneur', 'CEO', 'Consultant', 'Manager', 'Directeur'], '🎓', '#ec4899'),

-- ═══════════════════════════════════════════════════════════════
-- MAROC - ÉCOLES SPÉCIALISÉES
-- ═══════════════════════════════════════════════════════════════
('ENA Rabat', 'École Nationale d''Architecture de Rabat', 'Rabat, Maroc', 'public', 'arts', ARRAY['Architecture', 'Design Urbain', 'Patrimoine', 'Paysage'], 'Concours post-bac (option Sciences)', 14.0, 6, 'Diplôme d''État d''Architecte', ARRAY['Architecte', 'Urbaniste', 'Designer', 'Chef de Projet'], '🏠', '#2ecc71'),
('ENS', 'Écoles Normales Supérieures', 'Rabat/Fès, Maroc', 'public', 'education', ARRAY['Formation des Professeurs', 'Agrégation', 'Pédagogie'], 'Concours post-bac', 14.0, 5, 'Master en Éducation / Agrégation', ARRAY['Professeur du Secondaire', 'Formateur', 'Inspecteur'], '📖', '#3498db');

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA - CAREERS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.careers (title, title_fr, title_ar, domain, salary_min, salary_max, growth, skills, education, description) VALUES
('Software Engineer', 'Ingénieur Logiciel', 'مهندس برمجيات', 'technology', 12000, 35000, 340, ARRAY['JavaScript', 'Python', 'System Design', 'Problem Solving'], ARRAY['Computer Science', 'Software Engineering'], 'Design, develop, and maintain software applications and systems.'),
('Data Scientist', 'Data Scientist', 'عالم بيانات', 'technology', 15000, 45000, 280, ARRAY['Python', 'Machine Learning', 'Statistics', 'SQL'], ARRAY['Data Science', 'Statistics', 'Computer Science'], 'Analyze and interpret complex data to help organizations make decisions.'),
('Doctor (General)', 'Médecin Généraliste', 'طبيب عام', 'healthcare', 15000, 80000, 150, ARRAY['Diagnosis', 'Patient Care', 'Medical Knowledge', 'Communication'], ARRAY['Medicine'], 'Diagnose and treat patients for various medical conditions.'),
('Marketing Manager', 'Directeur Marketing', 'مدير التسويق', 'business', 18000, 50000, 180, ARRAY['Strategy', 'Digital Marketing', 'Analytics', 'Leadership'], ARRAY['Marketing', 'Business Administration'], 'Plan and execute marketing strategies to promote products or services.'),
('UX/UI Designer', 'Designer UX/UI', 'مصمم واجهات', 'creative', 10000, 30000, 220, ARRAY['Figma', 'User Research', 'Prototyping', 'Visual Design'], ARRAY['Design', 'HCI', 'Computer Science'], 'Create intuitive and visually appealing user interfaces.'),
('Civil Engineer', 'Ingénieur Civil', 'مهندس مدني', 'engineering', 12000, 40000, 120, ARRAY['AutoCAD', 'Structural Analysis', 'Project Management', 'Construction'], ARRAY['Civil Engineering'], 'Design and oversee construction of infrastructure projects.'),
('Financial Analyst', 'Analyste Financier', 'محلل مالي', 'business', 14000, 45000, 160, ARRAY['Excel', 'Financial Modeling', 'Valuation', 'Reporting'], ARRAY['Finance', 'Economics'], 'Analyze financial data and provide investment recommendations.'),
('AI/ML Engineer', 'Ingénieur IA/ML', 'مهندس ذكاء اصطناعي', 'technology', 18000, 60000, 400, ARRAY['Python', 'TensorFlow', 'PyTorch', 'Deep Learning'], ARRAY['Computer Science', 'AI'], 'Build and deploy artificial intelligence and machine learning systems.');

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
