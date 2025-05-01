export const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return `il y a ${interval} an${interval > 1 ? "s" : ""}`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return `il y a ${interval} mois`; // "mois" is the same in plural
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return `il y a ${interval} jour${interval > 1 ? "s" : ""}`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return `il y a ${interval} heure${interval > 1 ? "s" : ""}`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return `il y a ${interval} minute${interval > 1 ? "s" : ""}`;
    }
    return `il y a ${Math.floor(seconds)} seconde${seconds > 1 ? "s" : ""}`;
};

export const formatDate = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) return date;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};