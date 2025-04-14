export const  getNotesForStep=(step,notes)=> {
    switch (step){
        case 1:
            return [ 'typeFactoring', 'typeContrat', 'comiteRisque', 'comiteDerogation']
                .filter(key => Object.hasOwnProperty.call(notes, key));
        case 2:
            return [
                'devise',
                'previsionChiffreTotal',
                'previsionChiffreLocal',
                'previsionChiffreExport',
                'nombreAcheteur',
                'nombreRemise',
                'nombreDocumentRemise',
                'tauxConcentration',
                'nombreAvoir',
                'dureeMaxPaiement',
                'limiteFinAuto',
                'finMarge',
                'margeRet',

                'dateAcceptationRemise',
                'exigenceLittrage'
            ].filter(key => Object.hasOwnProperty.call(notes, key));
        case 3: // Step 3: ConditionGenerale3 fields
            return [ 'tmmText', 'resiliation', 'dateRevision', 'dateResiliation']
                .filter(key => Object.hasOwnProperty.call(notes, key));
        case 4: // Step 4: Dynamic commission/fond keys
            return Object.keys(notes).filter(key =>
                key.startsWith('commissions_') || key.startsWith('fondGaranti_')
            );
        default:
            return [];

    }
}