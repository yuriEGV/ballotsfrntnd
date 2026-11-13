export const PRICING_CATALOG = {
    currency: 'CLP',
    processes: {
        election: {
            kind: 'election',
            name: 'Votación Electrónica',
            baseFee: 50000,
            tiers: [
                { maxVoters: 100, ratePerVoter: 500 },
                { maxVoters: 500, ratePerVoter: 400 },
                { maxVoters: 2000, ratePerVoter: 300 },
                { maxVoters: null, ratePerVoter: 200 }
            ]
        },
        survey: {
            kind: 'survey',
            name: 'Encuesta / Plaza Ciudadana',
            baseFee: 25000,
            tiers: [
                { maxVoters: 200, ratePerVoter: 200 },
                { maxVoters: 1000, ratePerVoter: 150 },
                { maxVoters: 5000, ratePerVoter: 100 },
                { maxVoters: null, ratePerVoter: 70 }
            ]
        }
    },
    modules: {
        virtualAssembly: {
            key: 'virtualAssembly',
            label: 'Asamblea Virtual (Zoom Integrado)',
            price: 150000
        },
        technicalSupport: {
            key: 'technicalSupport',
            label: 'Soporte Técnico Dedicado',
            price: 100000
        },
        fullAuditPackage: {
            key: 'fullAuditPackage',
            label: 'Paquete Completo de Auditorías',
            description: 'Incluye evaluación previa por administrador, certificación de padrón, soporte dedicado y acta pericial Web3.',
            price: 220000
        }
    }
};

export const SURVEY_CATEGORIES = [
    'Ciudadanía',
    'Política y Contingencia',
    'Economía y Trabajo',
    'Comunidad y Barrio',
    'Consumo y Marcas',
    'Educación'
];

export const ELECTION_EVENT_TYPES = [
    'Sindicatos', 'Asociaciones', 'Juntas de Vecinos', 'Copropiedades',
    'Empresas', 'Colegios', 'Comité Paritario', 'Directiva',
    'Negociación Colectiva', 'Votación de Censura',
    'Cambio de Caja de Compensación', 'Reforma de Estatutos',
    'Afiliación a Federación', 'Consultas', 'Otro'
];

export const SURVEY_EVENT_TYPES = [
    'Encuesta Ciudadana', 'Encuesta Organizacional', 'Consultas',
    'Juntas de Vecinos', 'Empresas', 'Asociaciones', 'Otro'
];

export const formatCLP = (amount) => `$${Math.round(Number(amount) || 0).toLocaleString('es-CL')} CLP`;

export function normalizeModules(rawModules = {}) {
    const fullAuditPackage = Boolean(
        rawModules?.fullAuditPackage ||
        (Array.isArray(rawModules) && rawModules.includes('full_audit_package'))
    );
    const virtualAssembly = Boolean(
        rawModules?.virtualAssembly ||
        (Array.isArray(rawModules) && rawModules.includes('virtual_assembly'))
    );
    const technicalSupport = Boolean(
        rawModules?.technicalSupport ||
        fullAuditPackage ||
        (Array.isArray(rawModules) && rawModules.includes('technical_support'))
    );

    return {
        virtualAssembly,
        technicalSupport,
        fullAuditPackage
    };
}

export function resolveRatePerVoter(processKind, votersCount) {
    const plan = PRICING_CATALOG.processes[processKind] || PRICING_CATALOG.processes.election;
    const count = Math.max(0, Number(votersCount) || 0);
    for (const tier of plan.tiers) {
        if (tier.maxVoters === null || count <= tier.maxVoters) {
            return tier.ratePerVoter;
        }
    }
    return plan.tiers[plan.tiers.length - 1].ratePerVoter;
}

export function calculateProcessPricing({
    processKind = 'election',
    votersCount = 100,
    modules = {},
    discountPercentage = 0,
    freeSchoolBenefit = false
} = {}) {
    const kind = processKind === 'survey' ? 'survey' : 'election';
    const plan = PRICING_CATALOG.processes[kind];
    const count = Math.max(0, parseInt(votersCount, 10) || 0);
    const normalizedModules = normalizeModules(modules);

    const perVoterRate = resolveRatePerVoter(kind, count);
    const baseFee = plan.baseFee;
    const participantsFee = count * perVoterRate;

    let modulesFee = 0;
    if (normalizedModules.virtualAssembly) {
        modulesFee += PRICING_CATALOG.modules.virtualAssembly.price;
    }
    if (normalizedModules.fullAuditPackage) {
        modulesFee += PRICING_CATALOG.modules.fullAuditPackage.price;
    } else if (normalizedModules.technicalSupport) {
        modulesFee += PRICING_CATALOG.modules.technicalSupport.price;
    }

    const subtotal = baseFee + participantsFee + modulesFee;
    const requiresAdminReview = normalizedModules.fullAuditPackage;

    if (freeSchoolBenefit) {
        return {
            processKind: kind,
            votersCount: count,
            baseFee,
            perVoterRate,
            participantsFee,
            modulesFee,
            normalizedModules,
            requiresAdminReview,
            subtotal,
            discountPercentage: 100,
            discountAmount: subtotal,
            total: 0,
            freeSchoolBenefit: true
        };
    }

    const clampedDiscount = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
    const discountAmount = Math.round((subtotal * clampedDiscount) / 100);
    const total = Math.max(0, Math.round(subtotal - discountAmount));

    return {
        processKind: kind,
        votersCount: count,
        baseFee,
        perVoterRate,
        participantsFee,
        modulesFee,
        normalizedModules,
        requiresAdminReview,
        subtotal,
        discountPercentage: clampedDiscount,
        discountAmount,
        total,
        freeSchoolBenefit: false
    };
}

