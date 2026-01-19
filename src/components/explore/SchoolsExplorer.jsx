import { useState, useEffect } from 'react'
import './SchoolsExplorer.css'

const translations = {
    fr: {
        badge: 'Matrice de Connaissances',
        title: 'Explorez',
        titleHighlight: 'les écoles',
        description: 'Découvrez toutes les écoles, formations et opportunités qui correspondent à votre profil.',
        search: 'Rechercher une école...',
        filters: 'Filtres',
        domain: 'Domaine',
        city: 'Ville',
        type: 'Type',
        all: 'Tous',
        domains: {
            engineering: 'Ingénierie',
            business: 'Commerce',
            university: 'Université',
            arts: 'Architecture',
            education: 'Éducation'
        },
        cities: ['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA'],
        types: {
            public: 'Public',
            private: 'Privé'
        },
        admission: 'Admission',
        duration: 'Durée',
        years: 'ans',
        avgScore: 'Moyenne requise',
        specialties: 'Spécialités',
        careers: 'Débouchés',
        viewDetails: 'Voir détails',
        compare: 'Comparer',
        noResults: 'Aucune école trouvée'
    },
    en: {
        badge: 'Knowledge Matrix',
        title: 'Explore',
        titleHighlight: 'schools',
        description: 'Discover all schools, programs, and opportunities that match your profile.',
        search: 'Search for a school...',
        filters: 'Filters',
        domain: 'Domain',
        city: 'City',
        type: 'Type',
        all: 'All',
        domains: {
            engineering: 'Engineering',
            business: 'Business',
            university: 'University',
            arts: 'Architecture',
            education: 'Education'
        },
        cities: ['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA'],
        types: {
            public: 'Public',
            private: 'Private'
        },
        admission: 'Admission',
        duration: 'Duration',
        years: 'years',
        avgScore: 'Required average',
        specialties: 'Specialties',
        careers: 'Career paths',
        viewDetails: 'View details',
        compare: 'Compare',
        noResults: 'No schools found'
    },
    ar: {
        badge: 'مصفوفة المعرفة',
        title: 'استكشف',
        titleHighlight: 'المدارس',
        description: 'اكتشف جميع المدارس والبرامج والفرص التي تناسب ملفك الشخصي.',
        search: 'ابحث عن مدرسة...',
        filters: 'التصفية',
        domain: 'المجال',
        city: 'المدينة',
        type: 'النوع',
        all: 'الكل',
        domains: {
            engineering: 'الهندسة',
            business: 'التجارة',
            university: 'الجامعة',
            arts: 'الهندسة المعمارية',
            education: 'التعليم'
        },
        cities: ['الرباط، المغرب', 'الدار البيضاء، المغرب', 'مراكش، المغرب', 'أكادير، المغرب', 'إفران، المغرب', 'بنجرير، المغرب', 'فيلوربان، فرنسا', 'كومبيين، فرنسا', 'كامبريدج، أمريكا'],
        types: {
            public: 'عمومي',
            private: 'خاص'
        },
        admission: 'القبول',
        duration: 'المدة',
        years: 'سنوات',
        avgScore: 'المعدل المطلوب',
        specialties: 'التخصصات',
        careers: 'المهن',
        viewDetails: 'عرض التفاصيل',
        compare: 'مقارنة',
        noResults: 'لم يتم العثور على مدارس'
    }
}

const schoolsData = [
    // ═══════════════════════════════════════════════════════════════
    // FRANCE - ÉCOLES D'INGÉNIEURS POST-BAC
    // ═══════════════════════════════════════════════════════════════
    {
        id: 1,
        name: 'INSA Lyon',
        fullName: 'Institut National des Sciences Appliquées de Lyon',
        city: 'Villeurbanne, France',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Civil', 'Génie Électrique', 'Informatique', 'Génie Mécanique', 'Biosciences'],
        admissionMethod: 'Concours Commun INSA (post-bac)',
        averageScore: 16.0,
        duration: 5,
        diploma: 'Diplôme d\'Ingénieur (grade Master, accrédité CTI)',
        careers: ['Ingénieur R&D', 'Chef de Projet', 'Consultant', 'Directeur Technique'],
        logo: '🏫',
        color: '#667eea'
    },
    {
        id: 2,
        name: 'UTC',
        fullName: 'Université de Technologie de Compiègne',
        city: 'Compiègne, France',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Biologique', 'Informatique', 'Génie Mécanique', 'Génie des Procédés', 'Génie Urbain'],
        admissionMethod: 'Parcoursup / Groupe UT (dossier + entretien)',
        averageScore: 15.5,
        duration: 5,
        diploma: 'Diplôme d\'Ingénieur (grade Master, accrédité CTI)',
        careers: ['Ingénieur Informatique', 'Ingénieur Procédés', 'Chef de Projet Industriel', 'Consultant'],
        logo: '🔧',
        color: '#10b981'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES D'INGÉNIEURS POST-BAC
    // ═══════════════════════════════════════════════════════════════
    {
        id: 3,
        name: 'ENSAM Casablanca',
        fullName: 'École Nationale Supérieure d\'Arts et Métiers de Casablanca',
        city: 'Casablanca, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Mécanique', 'Systèmes Industriels', 'Automatique', 'Productique'],
        admissionMethod: 'Concours National (post-bac marocain)',
        averageScore: 15.0,
        duration: 5,
        diploma: 'Diplôme d\'Ingénieur (reconnu État marocain, habilité CTI)',
        careers: ['Ingénieur Mécanique', 'Ingénieur Production', 'Chef d\'Atelier', 'Consultant Industrie'],
        logo: '⚙️',
        color: '#f97316'
    },
    {
        id: 4,
        name: 'Mines Rabat',
        fullName: 'École Nationale Supérieure des Mines de Rabat',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Ingénierie Minière', 'Énergie', 'Environnement', 'Génie Industriel'],
        admissionMethod: 'Concours National Commun CNC (après CPGE)',
        averageScore: 17.0,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Mines', 'Ingénieur Énergie', 'Chef de Projet', 'Directeur Industriel'],
        logo: '⛏️',
        color: '#f59e0b'
    },
    // ═══════════════════════════════════════════════════════════════
    // FRANCE - ÉCOLES DE COMMERCE POST-BAC
    // ═══════════════════════════════════════════════════════════════
    {
        id: 5,
        name: 'EM Normandie',
        fullName: 'EM Normandie Business School',
        city: 'Caen/Le Havre/Paris, France',
        type: 'private',
        domain: 'business',
        specialties: ['Management', 'Marketing', 'Finance', 'International Business', 'Entrepreneuriat'],
        admissionMethod: 'Concours Sésame / Tests EMN (post-bac)',
        averageScore: 13.0,
        duration: 5,
        diploma: 'Master Grande École (visé par l\'État, grade Master)',
        careers: ['Manager', 'Consultant', 'Entrepreneur', 'Directeur Marketing', 'Analyste Financier'],
        logo: '🎓',
        color: '#8b5cf6'
    },
    // ═══════════════════════════════════════════════════════════════
    // INTERNATIONAL - UNIVERSITÉS
    // ═══════════════════════════════════════════════════════════════
    {
        id: 6,
        name: 'MIT',
        fullName: 'Massachusetts Institute of Technology',
        city: 'Cambridge, USA',
        type: 'private',
        domain: 'engineering',
        specialties: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Economics', 'Biology'],
        admissionMethod: 'Application sélective (SAT/ACT + TOEFL/IELTS)',
        averageScore: 18.0,
        duration: 4,
        diploma: 'Bachelor of Science (accrédité NEASC)',
        careers: ['Software Engineer', 'Research Scientist', 'Entrepreneur', 'Professor', 'CEO Tech'],
        logo: '🏛️',
        color: '#a31f34'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - UNIVERSITÉS PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    {
        id: 7,
        name: 'UM5',
        fullName: 'Université Mohammed V de Rabat',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'university',
        specialties: ['Droit', 'Sciences', 'Médecine', 'Ingénierie', 'Lettres', 'Économie'],
        admissionMethod: 'Baccalauréat marocain',
        averageScore: 12.0,
        duration: 3,
        diploma: 'Licence / Master / Doctorat (système LMD)',
        careers: ['Fonctionnaire', 'Cadre d\'Entreprise', 'Enseignant', 'Chercheur', 'Ingénieur'],
        logo: '🎓',
        color: '#1e3a5f'
    },
    {
        id: 8,
        name: 'Hassan II',
        fullName: 'Université Hassan II de Casablanca',
        city: 'Casablanca, Maroc',
        type: 'public',
        domain: 'university',
        specialties: ['Sciences', 'Lettres', 'Économie', 'Ingénierie', 'Médecine'],
        admissionMethod: 'Baccalauréat marocain',
        averageScore: 12.0,
        duration: 3,
        diploma: 'Licence / Master / Doctorat (système LMD)',
        careers: ['Cadre', 'Enseignant', 'Chercheur', 'Manager', 'Ingénieur'],
        logo: '📚',
        color: '#0d4c92'
    },
    {
        id: 9,
        name: 'UCA',
        fullName: 'Université Cadi Ayyad de Marrakech',
        city: 'Marrakech, Maroc',
        type: 'public',
        domain: 'university',
        specialties: ['Sciences', 'Lettres', 'Ingénierie', 'Médecine', 'Arts'],
        admissionMethod: 'Baccalauréat marocain',
        averageScore: 12.0,
        duration: 3,
        diploma: 'Licence / Master / Doctorat (système LMD)',
        careers: ['Enseignant', 'Chercheur', 'Cadre', 'Médecin', 'Ingénieur'],
        logo: '🏫',
        color: '#c41e3a'
    },
    {
        id: 10,
        name: 'UIZ',
        fullName: 'Université Ibn Zohr d\'Agadir',
        city: 'Agadir, Maroc',
        type: 'public',
        domain: 'university',
        specialties: ['Sciences', 'Ingénierie', 'Tourisme', 'Gestion', 'Lettres'],
        admissionMethod: 'Baccalauréat marocain',
        averageScore: 12.0,
        duration: 3,
        diploma: 'Licence / Master / Doctorat (système LMD)',
        careers: ['Manager Tourisme', 'Ingénieur', 'Enseignant', 'Cadre', 'Entrepreneur'],
        logo: '🌴',
        color: '#2e8b57'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - GRANDES ÉCOLES D'INGÉNIEURS PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    {
        id: 11,
        name: 'EMI',
        fullName: 'École Mohammadia d\'Ingénieurs',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Civil', 'Génie Électrique', 'Mécanique', 'Informatique Industrielle'],
        admissionMethod: 'Concours National Commun CNC (après CPGE)',
        averageScore: 17.0,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Civil', 'Ingénieur Industriel', 'Chef de Projet', 'Consultant'],
        logo: '🏗️',
        color: '#f59e0b'
    },
    {
        id: 12,
        name: 'ENSIAS',
        fullName: 'École Nationale Supérieure d\'Informatique et d\'Analyse des Systèmes',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Informatique', 'Génie Logiciel', 'Data Science', 'Cybersécurité', 'IA'],
        admissionMethod: 'Concours National Commun CNC (après CPGE)',
        averageScore: 16.5,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Logiciel', 'Data Scientist', 'Architecte SI', 'Tech Lead'],
        logo: '💻',
        color: '#667eea'
    },
    {
        id: 13,
        name: 'EHTP',
        fullName: 'École Hassania des Travaux Publics',
        city: 'Casablanca, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Civil', 'Télécommunications', 'Informatique', 'Hydraulique'],
        admissionMethod: 'Concours National Commun CNC (après CPGE)',
        averageScore: 16.3,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Civil', 'Ingénieur Télécom', 'Urbaniste'],
        logo: '🏛️',
        color: '#0ea5e9'
    },
    {
        id: 14,
        name: 'ECC',
        fullName: 'École Centrale Casablanca',
        city: 'Casablanca, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Ingénierie Généraliste', 'Électrique', 'Mécanique', 'Informatique'],
        admissionMethod: 'Concours CNC (après CPGE)',
        averageScore: 16.5,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Généraliste', 'Chef de Projet', 'Consultant', 'Entrepreneur'],
        logo: '⚡',
        color: '#ff6b35'
    },
    {
        id: 15,
        name: 'INSEA',
        fullName: 'Institut National de Statistique et d\'Économie Appliquée',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Statistique', 'Économie Appliquée', 'Actuariat', 'Data Science'],
        admissionMethod: 'Concours (après CPGE)',
        averageScore: 16.0,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur Statisticien-Économiste',
        careers: ['Statisticien', 'Actuaire', 'Data Analyst', 'Économiste'],
        logo: '📊',
        color: '#6b5b95'
    },
    {
        id: 16,
        name: 'INPT',
        fullName: 'Institut National des Postes et Télécommunications',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Télécommunications', 'Réseaux', 'IoT', 'Cloud Computing', 'Cybersécurité'],
        admissionMethod: 'Concours National Commun CNC (après CPGE)',
        averageScore: 16.8,
        duration: 3,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur Réseau', 'Ingénieur Télécom', 'DevOps', 'Expert Sécurité'],
        logo: '📡',
        color: '#10b981'
    },
    {
        id: 17,
        name: 'ENSA',
        fullName: 'Écoles Nationales des Sciences Appliquées',
        city: 'Plusieurs villes, Maroc',
        type: 'public',
        domain: 'engineering',
        specialties: ['Génie Civil', 'Informatique', 'Électrique', 'Mécanique', 'Procédés'],
        admissionMethod: 'Concours post-bac CNC',
        averageScore: 15.0,
        duration: 5,
        diploma: 'Diplôme d\'Ingénieur d\'État',
        careers: ['Ingénieur', 'Chef de Projet', 'Consultant', 'Entrepreneur'],
        logo: '🔬',
        color: '#4a90d9'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES DE COMMERCE PUBLIQUES
    // ═══════════════════════════════════════════════════════════════
    {
        id: 18,
        name: 'ENCG',
        fullName: 'Écoles Nationales de Commerce et de Gestion',
        city: 'Plusieurs villes, Maroc',
        type: 'public',
        domain: 'business',
        specialties: ['Marketing', 'Finance', 'Management', 'Gestion', 'Commerce International'],
        admissionMethod: 'Concours TAGEM (post-bac)',
        averageScore: 14.0,
        duration: 5,
        diploma: 'Diplôme ENCG (Master Spécialisé)',
        careers: ['Manager', 'Analyste Financier', 'Consultant', 'Directeur Commercial'],
        logo: '📈',
        color: '#8b5cf6'
    },
    {
        id: 19,
        name: 'ISCAE',
        fullName: 'Institut Supérieur de Commerce et d\'Administration des Entreprises',
        city: 'Casablanca, Maroc',
        type: 'public',
        domain: 'business',
        specialties: ['Administration des Entreprises', 'Finance', 'Audit', 'Marketing'],
        admissionMethod: 'Concours ISCAE',
        averageScore: 15.0,
        duration: 5,
        diploma: 'Diplôme Grande École',
        careers: ['Manager', 'Auditeur', 'Analyste Financier', 'Entrepreneur'],
        logo: '💼',
        color: '#7c3aed'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - UNIVERSITÉS ET ÉCOLES PRIVÉES
    // ═══════════════════════════════════════════════════════════════
    {
        id: 20,
        name: 'AUI',
        fullName: 'Al Akhawayn University in Ifrane',
        city: 'Ifrane, Maroc',
        type: 'private',
        domain: 'university',
        specialties: ['Économie', 'Relations Internationales', 'Ingénierie', 'Droit', 'Sciences Sociales'],
        admissionMethod: 'Dossier + TOEFL/IELTS obligatoire',
        averageScore: 14.0,
        duration: 4,
        diploma: 'Bachelor / Master (accréditation américaine)',
        careers: ['Manager International', 'Diplomate', 'Ingénieur', 'Consultant', 'Entrepreneur'],
        logo: '🏔️',
        color: '#003366'
    },
    {
        id: 21,
        name: 'UIR',
        fullName: 'Université Internationale de Rabat',
        city: 'Salé, Maroc',
        type: 'private',
        domain: 'university',
        specialties: ['Ingénierie', 'Gestion', 'Droit', 'Architecture', 'Santé', 'IA'],
        admissionMethod: 'Concours sélectif UIR',
        averageScore: 14.0,
        duration: 5,
        diploma: 'Diplômes LMD / Ingénieur',
        careers: ['Ingénieur', 'Architecte', 'Manager', 'Médecin', 'Juriste'],
        logo: '🌐',
        color: '#1e90ff'
    },
    {
        id: 22,
        name: 'UM6P',
        fullName: 'Université Mohammed VI Polytechnique',
        city: 'Ben Guerir, Maroc',
        type: 'private',
        domain: 'engineering',
        specialties: ['Sciences Naturelles', 'Ingénierie', 'Agronomie', 'IA', 'Matériaux Avancés'],
        admissionMethod: 'Dossier + Sélection',
        averageScore: 15.5,
        duration: 5,
        diploma: 'Diplômes LMD / Ingénieur',
        careers: ['Chercheur', 'Ingénieur', 'Entrepreneur', 'Data Scientist', 'Agronome'],
        logo: '🔬',
        color: '#06b6d4'
    },
    {
        id: 23,
        name: 'HEM',
        fullName: 'Hautes Études de Management',
        city: 'Plusieurs villes, Maroc',
        type: 'private',
        domain: 'business',
        specialties: ['Business Administration', 'Entrepreneuriat', 'Marketing', 'Finance'],
        admissionMethod: 'Concours HEM',
        averageScore: 13.0,
        duration: 5,
        diploma: 'Bachelor / Master (accrédité)',
        careers: ['Entrepreneur', 'CEO', 'Consultant', 'Manager', 'Directeur'],
        logo: '🎓',
        color: '#ec4899'
    },
    // ═══════════════════════════════════════════════════════════════
    // MAROC - ÉCOLES SPÉCIALISÉES
    // ═══════════════════════════════════════════════════════════════
    {
        id: 24,
        name: 'ENA Rabat',
        fullName: 'École Nationale d\'Architecture de Rabat',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'arts',
        specialties: ['Architecture', 'Design Urbain', 'Patrimoine', 'Paysage'],
        admissionMethod: 'Concours post-bac (option Sciences)',
        averageScore: 14.0,
        duration: 6,
        diploma: 'Diplôme d\'État d\'Architecte',
        careers: ['Architecte', 'Urbaniste', 'Designer', 'Chef de Projet'],
        logo: '🏠',
        color: '#2ecc71'
    },
    {
        id: 25,
        name: 'ENS',
        fullName: 'Écoles Normales Supérieures',
        city: 'Rabat, Maroc',
        type: 'public',
        domain: 'education',
        specialties: ['Formation des Professeurs', 'Agrégation', 'Pédagogie'],
        admissionMethod: 'Concours post-bac',
        averageScore: 14.0,
        duration: 5,
        diploma: 'Master en Éducation / Agrégation',
        careers: ['Professeur du Secondaire', 'Formateur', 'Inspecteur'],
        logo: '📖',
        color: '#3498db'
    }
];

const SchoolsExplorer = ({ language = 'fr' }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        domain: 'all',
        city: 'all',
        type: 'all'
    })
    const [selectedSchool, setSelectedSchool] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [showCompareModal, setShowCompareModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const t = translations[language]
    const isRTL = language === 'ar'

    const filteredSchools = schoolsData.filter(school => {
        const matchesSearch =
            school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            school.fullName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDomain = filters.domain === 'all' || school.domain === filters.domain
        const matchesCity = filters.city === 'all' || school.city.includes(filters.city) || filters.city.includes(school.city)
        const matchesType = filters.type === 'all' || school.type === filters.type

        return matchesSearch && matchesDomain && matchesCity && matchesType
    })

    const toggleCompare = (school) => {
        if (compareList.find(s => s.id === school.id)) {
            setCompareList(compareList.filter(s => s.id !== school.id))
        } else if (compareList.length < 3) {
            setCompareList([...compareList, school])
        }
    }

    const openCompareModal = () => {
        if (compareList.length >= 2) {
            setShowCompareModal(true)
        }
    }

    const openDetailModal = (school) => {
        setSelectedSchool(school)
        setShowDetailModal(true)
    }

    return (
        <section className={`schools-explorer section ${isRTL ? 'rtl' : ''}`}>
            <div className="container">
                {/* Header */}
                <div className="explorer-header">
                    <span className="section-badge">{t.badge}</span>
                    <h2 className="explorer-title">
                        {t.title} <span className="text-gradient">{t.titleHighlight}</span>
                    </h2>
                    <p className="explorer-description">{t.description}</p>
                </div>

                {/* Search & Filters */}
                <div className="explorer-controls glass">
                    {/* Search */}
                    <div className="search-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="filters-row">
                        {/* Domain Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.domain}</label>
                            <select
                                className="filter-select"
                                value={filters.domain}
                                onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {Object.entries(t.domains).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.city}</label>
                            <select
                                className="filter-select"
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {['Rabat, Maroc', 'Casablanca, Maroc', 'Marrakech, Maroc', 'Agadir, Maroc', 'Salé, Maroc', 'Ifrane, Maroc', 'Ben Guerir, Maroc', 'Villeurbanne, France', 'Compiègne, France', 'Cambridge, USA', 'Caen/Le Havre/Paris, France'].map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">{t.type}</label>
                            <select
                                className="filter-select"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="all">{t.all}</option>
                                {Object.entries(t.types).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Schools Grid */}
                <div className="schools-grid">
                    {filteredSchools.length === 0 ? (
                        <div className="no-results glass-card">
                            <span className="no-results-icon">🔍</span>
                            <p>{t.noResults}</p>
                        </div>
                    ) : (
                        filteredSchools.map((school, index) => (
                            <div
                                key={school.id}
                                className="school-card glass-card animate-fade-in-up"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    '--school-color': school.color
                                }}
                            >
                                {/* Header */}
                                <div className="school-header">
                                    <div className="school-logo" style={{ background: `${school.color}20` }}>
                                        {school.logo}
                                    </div>
                                    <div className="school-badges">
                                        <span className={`school-type-badge ${school.type}`}>
                                            {t.types[school.type]}
                                        </span>
                                        <span className="school-domain-badge">
                                            {t.domains[school.domain]}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <h3 className="school-name">{school.name}</h3>
                                <p className="school-fullname">{school.fullName}</p>
                                <p className="school-city">📍 {school.city}</p>

                                {/* Stats */}
                                <div className="school-stats">
                                    <div className="stat">
                                        <span className="stat-value">{school.averageScore}</span>
                                        <span className="stat-label">{t.avgScore}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{school.duration}</span>
                                        <span className="stat-label">{t.years}</span>
                                    </div>
                                </div>

                                {/* Specialties */}
                                <div className="school-specialties">
                                    {school.specialties.slice(0, 3).map((specialty, idx) => (
                                        <span key={idx} className="specialty-tag">{specialty}</span>
                                    ))}
                                    {school.specialties.length > 3 && (
                                        <span className="specialty-more">+{school.specialties.length - 3}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="school-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => openDetailModal(school)}
                                    >
                                        {t.viewDetails}
                                    </button>
                                    <button
                                        className={`btn btn-secondary btn-sm compare-btn ${compareList.find(s => s.id === school.id) ? 'active' : ''}`}
                                        onClick={() => toggleCompare(school)}
                                    >
                                        {compareList.find(s => s.id === school.id) ? '✓' : '+'} {t.compare}
                                    </button>
                                </div>

                                {/* Accent Line */}
                                <div className="school-accent" style={{ background: school.color }}></div>
                            </div>
                        ))
                    )}
                </div>

                {/* Compare Bar */}
                {
                    compareList.length > 0 && (
                        <div className="compare-bar glass animate-fade-in-up">
                            <div className="compare-schools">
                                {compareList.map(school => (
                                    <div key={school.id} className="compare-item">
                                        <span className="compare-logo">{school.logo}</span>
                                        <span className="compare-name">{school.name}</span>
                                        <button
                                            className="compare-remove"
                                            onClick={() => toggleCompare(school)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={`btn btn-primary ${compareList.length < 2 ? 'disabled' : ''}`}
                                onClick={openCompareModal}
                                disabled={compareList.length < 2}
                            >
                                {t.compare} ({compareList.length}/3)
                            </button>
                        </div>
                    )
                }

                {/* Comparison Modal */}
                {
                    showCompareModal && (
                        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
                            <div className="modal-content compare-modal glass-card" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2 className="modal-title">
                                        {language === 'fr' ? '📊 Comparaison des Écoles' :
                                            language === 'ar' ? '📊 مقارنة المدارس' : '📊 Schools Comparison'}
                                    </h2>
                                    <button className="modal-close" onClick={() => setShowCompareModal(false)}>×</button>
                                </div>

                                <div className="comparison-table-wrapper">
                                    <table className="comparison-table">
                                        <thead>
                                            <tr>
                                                <th className="criteria-header">
                                                    {language === 'fr' ? 'Critère' : language === 'ar' ? 'المعيار' : 'Criteria'}
                                                </th>
                                                {compareList.map(school => (
                                                    <th key={school.id} className="school-header" style={{ borderTop: `4px solid ${school.color}` }}>
                                                        <span className="th-logo">{school.logo}</span>
                                                        <span className="th-name">{school.name}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Nom complet' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>{school.fullName}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Ville' : language === 'ar' ? 'المدينة' : 'City'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>📍 {school.city}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Type' : language === 'ar' ? 'النوع' : 'Type'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className={`type-badge ${school.type}`}>
                                                            {t.types[school.type]}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Domaine' : language === 'ar' ? 'المجال' : 'Domain'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className="domain-badge">
                                                            {t.domains[school.domain] || school.domain}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Durée' : language === 'ar' ? 'المدة' : 'Duration'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <strong>{school.duration}</strong> {t.years}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Moyenne requise' : language === 'ar' ? 'المعدل المطلوب' : 'Required Average'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <span className="score-badge">{school.averageScore}/20</span>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Admission' : language === 'ar' ? 'القبول' : 'Admission'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>{school.admissionMethod}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Diplôme' : language === 'ar' ? 'الشهادة' : 'Diploma'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>🎓 {school.diploma}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Spécialités' : language === 'ar' ? 'التخصصات' : 'Specialties'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <div className="specialties-list">
                                                            {school.specialties.slice(0, 4).map((spec, idx) => (
                                                                <span key={idx} className="mini-tag">{spec}</span>
                                                            ))}
                                                            {school.specialties.length > 4 && (
                                                                <span className="mini-tag more">+{school.specialties.length - 4}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className="criteria-label">
                                                    {language === 'fr' ? 'Débouchés' : language === 'ar' ? 'الآفاق المهنية' : 'Career Paths'}
                                                </td>
                                                {compareList.map(school => (
                                                    <td key={school.id}>
                                                        <div className="careers-list">
                                                            {school.careers.slice(0, 3).map((career, idx) => (
                                                                <span key={idx} className="career-item">• {career}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowCompareModal(false)}>
                                        {language === 'fr' ? 'Fermer' : language === 'ar' ? 'إغلاق' : 'Close'}
                                    </button>
                                    <button className="btn btn-primary" onClick={() => {
                                        setCompareList([])
                                        setShowCompareModal(false)
                                    }}>
                                        {language === 'fr' ? 'Réinitialiser' : language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* School Detail Modal */}
                {
                    showDetailModal && selectedSchool && (
                        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                            <div className="modal-content detail-modal glass-card" onClick={e => e.stopPropagation()}>
                                <div className="modal-header" style={{ borderBottom: `3px solid ${selectedSchool.color}` }}>
                                    <div className="detail-header-info">
                                        <span className="detail-logo">{selectedSchool.logo}</span>
                                        <div>
                                            <h2 className="modal-title">{selectedSchool.name}</h2>
                                            <p className="detail-fullname">{selectedSchool.fullName}</p>
                                        </div>
                                    </div>
                                    <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                                </div>

                                <div className="detail-content">
                                    <div className="detail-badges">
                                        <span className={`school-type-badge ${selectedSchool.type}`}>
                                            {t.types[selectedSchool.type]}
                                        </span>
                                        <span className="school-domain-badge">
                                            {t.domains[selectedSchool.domain] || selectedSchool.domain}
                                        </span>
                                    </div>

                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">📍 {language === 'fr' ? 'Ville' : 'City'}</span>
                                            <span className="detail-value">{selectedSchool.city}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">⏱️ {language === 'fr' ? 'Durée' : 'Duration'}</span>
                                            <span className="detail-value">{selectedSchool.duration} {t.years}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">📊 {language === 'fr' ? 'Moyenne requise' : 'Required Avg'}</span>
                                            <span className="detail-value score">{selectedSchool.averageScore}/20</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">📝 {language === 'fr' ? 'Admission' : 'Admission'}</span>
                                            <span className="detail-value">{selectedSchool.admissionMethod}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🎓 {language === 'fr' ? 'Diplôme' : 'Diploma'}</h4>
                                        <p>{selectedSchool.diploma}</p>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🔬 {language === 'fr' ? 'Spécialités' : 'Specialties'}</h4>
                                        <div className="detail-tags">
                                            {selectedSchool.specialties.map((spec, idx) => (
                                                <span key={idx} className="specialty-tag">{spec}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>💼 {language === 'fr' ? 'Débouchés professionnels' : 'Career Paths'}</h4>
                                        <ul className="careers-detail-list">
                                            {selectedSchool.careers.map((career, idx) => (
                                                <li key={idx}>{career}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                        {language === 'fr' ? 'Fermer' : language === 'ar' ? 'إغلاق' : 'Close'}
                                    </button>
                                    <button
                                        className={`btn btn-primary ${compareList.find(s => s.id === selectedSchool.id) ? 'active' : ''}`}
                                        onClick={() => toggleCompare(selectedSchool)}
                                    >
                                        {compareList.find(s => s.id === selectedSchool.id) ? '✓ ' : '+ '}
                                        {t.compare}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </section>
    )
}

export default SchoolsExplorer
