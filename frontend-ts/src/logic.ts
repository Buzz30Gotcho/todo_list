import type { Todo } from './types.js';

export type Filter = 'all' | 'active' | 'done';

// Filtre les tâches selon l'onglet actif.
export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'done') return todos.filter(t => t.completed);
    return todos;
}

// Calcule le total, le nombre de terminées et le nombre restantes.
export function countStats(todos: Todo[]): { total: number; done: number; remaining: number } {
    const done = todos.filter(t => t.completed).length;
    return {
        total: todos.length,
        done,
        remaining: todos.length - done,
    };
}

// Formate le sous-titre ("X actives · Y terminées").
export function formatSubtitle(stats: { total: number; done: number; remaining: number }): string {
    if (stats.total === 0) return 'Aucune tâche pour le moment';
    const active = `${stats.remaining} active${stats.remaining > 1 ? 's' : ''}`;
    const done = `${stats.done} terminée${stats.done > 1 ? 's' : ''}`;
    return `${active} · ${done}`;
}

// Valide un titre avant création.
export function isValidTitle(title: string): boolean {
    return title.trim().length > 0;
}

// Retourne le message d'état vide selon le filtre.
export function emptyMessage(filter: Filter): { emoji: string; text: string } {
    if (filter === 'active') return { emoji: '🎉', text: 'Tout est fait, bravo !' };
    if (filter === 'done') return { emoji: '📭', text: 'Aucune tâche terminée' };
    return { emoji: '📝', text: 'Ajoute ta première tâche' };
}