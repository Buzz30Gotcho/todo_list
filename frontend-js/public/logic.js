// Logique pure de la todolist (testable sans DOM).

// Filtre les tâches selon l'onglet actif.
export function filterTodos(todos, filter) {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'done') return todos.filter(t => t.completed);
    return todos;
}

// Calcule le total, le nombre de terminées et le nombre restantes.
export function countStats(todos) {
    const done = todos.filter(t => t.completed).length;
    return {
        total: todos.length,
        done,
        remaining: todos.length - done,
    };
}

// Formate le sous-titre ("X actives · Y terminées").
export function formatSubtitle(stats) {
    if (stats.total === 0) return 'Aucune tâche pour le moment';
    const active = `${stats.remaining} active${stats.remaining > 1 ? 's' : ''}`;
    const done = `${stats.done} terminée${stats.done > 1 ? 's' : ''}`;
    return `${active} · ${done}`;
}

// Valide un titre avant création.
export function isValidTitle(title) {
    return title.trim().length > 0;
}

// Retourne le message d'état vide selon le filtre.
export function emptyMessage(filter) {
    if (filter === 'active') return { emoji: '🎉', text: 'Tout est fait, bravo !' };
    if (filter === 'done') return { emoji: '📭', text: 'Aucune tâche terminée' };
    return { emoji: '📝', text: 'Ajoute ta première tâche' };
}