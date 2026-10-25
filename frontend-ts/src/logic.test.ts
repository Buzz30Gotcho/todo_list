import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
    filterTodos,
    countStats,
    formatSubtitle,
    isValidTitle,
    emptyMessage,
} from './logic.js';
import type { Todo } from './types.js';

// Jeu de données réutilisé par les tests : 2 actives, 1 terminée.
const sample: Todo[] = [
    { id: 1, title: 'A', description: '', completed: false, created_at: '' },
    { id: 2, title: 'B', description: '', completed: true, created_at: '' },
    { id: 3, title: 'C', description: '', completed: false, created_at: '' },
];

// --- filterTodos : vérifie le filtrage selon l'onglet ---
describe('filterTodos', () => {
    test('"all" retourne tout', () => {
        assert.equal(filterTodos(sample, 'all').length, 3);
    });

    test('"active" ne retourne que les non terminées', () => {
        const result = filterTodos(sample, 'active');
        assert.equal(result.length, 2);
        assert.ok(result.every(t => !t.completed));
    });

    test('"done" ne retourne que les terminées', () => {
        const result = filterTodos(sample, 'done');
        assert.equal(result.length, 1);
        assert.equal(result[0].title, 'B');
    });

    // Cas limite : aucune tâche à filtrer.
    test('liste vide → résultat vide', () => {
        assert.equal(filterTodos([], 'all').length, 0);
        assert.equal(filterTodos([], 'active').length, 0);
        assert.equal(filterTodos([], 'done').length, 0);
    });
});

// --- countStats : vérifie le calcul des statistiques ---
describe('countStats', () => {
    test('calcule bien les totaux', () => {
        const stats = countStats(sample);
        assert.equal(stats.total, 3);
        assert.equal(stats.done, 1);
        assert.equal(stats.remaining, 2);
    });

    // Cas limite : aucune tâche.
    test('liste vide → tout à zéro', () => {
        const stats = countStats([]);
        assert.equal(stats.total, 0);
        assert.equal(stats.done, 0);
        assert.equal(stats.remaining, 0);
    });

    // Cas limite : tout est terminé.
    test('tout terminé → remaining = 0', () => {
        const allDone: Todo[] = sample.map(t => ({ ...t, completed: true }));
        const stats = countStats(allDone);
        assert.equal(stats.done, 3);
        assert.equal(stats.remaining, 0);
    });
});

// --- formatSubtitle : vérifie le texte du sous-titre ---
describe('formatSubtitle', () => {
    // Cas limite : aucune tâche → message dédié.
    test('liste vide → message dédié', () => {
        assert.equal(
            formatSubtitle({ total: 0, done: 0, remaining: 0 }),
            'Aucune tâche pour le moment'
        );
    });

    // Vérifie le singulier (1 active, 1 terminée).
    test('singulier pour 1 active / 1 terminée', () => {
        assert.equal(
            formatSubtitle({ total: 2, done: 1, remaining: 1 }),
            '1 active · 1 terminée'
        );
    });

    // Vérifie le pluriel (plusieurs actives, plusieurs terminées).
    test('pluriel pour plusieurs actives / terminées', () => {
        assert.equal(
            formatSubtitle({ total: 5, done: 2, remaining: 3 }),
            '3 actives · 2 terminées'
        );
    });
});

// --- isValidTitle : vérifie la validation d'un titre ---
describe('isValidTitle', () => {
    // Titre normal accepté.
    test('titre normal → valide', () => {
        assert.equal(isValidTitle('courses'), true);
    });

    // Les espaces autour sont ignorés (trim).
    test('titre avec espaces autour → valide', () => {
        assert.equal(isValidTitle('  courses  '), true);
    });

    // Titre vide refusé.
    test('titre vide → invalide', () => {
        assert.equal(isValidTitle(''), false);
    });

    // Un titre composé uniquement d'espaces est refusé.
    test('titre uniquement espaces → invalide', () => {
        assert.equal(isValidTitle('   '), false);
    });
});

// --- emptyMessage : vérifie le message d'état vide selon le filtre ---
describe('emptyMessage', () => {
    // Filtre "active" : tout est fait.
    test('"active" → message de félicitations', () => {
        const msg = emptyMessage('active');
        assert.equal(msg.emoji, '🎉');
        assert.equal(msg.text, 'Tout est fait, bravo !');
    });

    // Filtre "done" : aucune tâche terminée.
    test('"done" → message vide', () => {
        const msg = emptyMessage('done');
        assert.equal(msg.emoji, '📭');
        assert.equal(msg.text, 'Aucune tâche terminée');
    });

    // Filtre "all" : invitation à ajouter une tâche.
    test('"all" → message d\'invitation', () => {
        const msg = emptyMessage('all');
        assert.equal(msg.emoji, '📝');
        assert.equal(msg.text, 'Ajoute ta première tâche');
    });
});