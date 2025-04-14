export const roleConverter = (role) => {
    switch (role) {
        case 'ROLE_ADMIN':
            return 'Administrateur';
        case 'ROLE_RES_COMERCIAL':
            return 'Responsable Commercial';
        case 'ROLE_RES_ACHAT':
            return 'Responsable Achat';
        case 'ROLE_RES_FINANCEMENT':
            return 'Responsable Financement';
        case "ROLE_RES_JURIDIQUE":
            return "Responsable Juridique";
        case "ROLE_VALIDATEUR":
            return "Validateur Du Contrat";
        case "ROLE_SIGNATAIRE":
            return "Signataire Du Contrat";
        default:
            return role;
    }
}