

export interface Analysis {
    sentimentEstimate: number,
    confidenceLevel: number,
    verbalAnalysis: string,
    suggestions: string[]
};

export interface NurseMemo {
    client_health: string,
    conversation_topics: string[],
    client_wishes: string[],
    client_address: string,
    visit_time: string,
    actions: string[]
};

export interface NurseVisitReport {
    report: string,
    blood_pressure: string,
    blood_sugar: string,
    actions: string[]
};

  