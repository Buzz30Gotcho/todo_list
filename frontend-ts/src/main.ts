import { getTodos, createTodo, updateTodo, deleteTodo } from './api.js';
import type { Todo } from './types.js';
import {
    filterTodos,
    countStats,
    formatSubtitle,
    isValidTitle,
    emptyMessage,
} from './logic.js';
import type { Filter } from './logic.js';

let todos: Todo[] = [];
let filter: Filter = 'all';
let editingId: number | null = null;
const removingIds = new Set<number>();

const el = (id: string): HTMLElement => document.getElementById(id)!;

async function refresh(): Promise<void> {
    try {
        todos = await getTodos();
        render();
    } catch {
        el('content').innerHTML =
            '<div class="error">Impossible de contacter l\'API. Le backend est-il démarré ?</div>';
    }
}

function makeButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.className = className;
    b.textContent = label;
    b.onclick = onClick;
    return b;
}

function renderItem(todo: Todo): HTMLLIElement {
    const li = document.createElement('li');
    li.className =
        'item' +
        (todo.completed ? ' done' : '') +
        (removingIds.has(todo.id) ? ' removing' : '');

    // Mode édition
    if (editingId === todo.id) {
        const zone = document.createElement('div');
        zone.className = 'edit-zone';

        const titleInput = document.createElement('input');
        titleInput.className = 'input';
        titleInput.value = todo.title;

        const descInput = document.createElement('input');
        descInput.className = 'input';
        descInput.placeholder = 'Description (optionnel)';
        descInput.value = todo.description || '';

        const actions = document.createElement('div');
        actions.className = 'actions';
        actions.style.opacity = '1';
        actions.append(
            makeButton('Enregistrer', 'btn btn-primary btn-sm', async () => {
                if (!isValidTitle(titleInput.value)) return;
                await updateTodo(todo.id, {
                    title: titleInput.value.trim(),
                    description: descInput.value.trim(),
                });
                editingId = null;
                void refresh();
            }),
            makeButton('Annuler', 'btn btn-ghost btn-sm', () => {
                editingId = null;
                render();
            })
        );

        zone.append(titleInput, descInput, actions);
        li.appendChild(zone);
        return li;
    }

    // Mode affichage
    const check = document.createElement('button');
    check.className = 'check';
    check.setAttribute('aria-label', 'Marquer comme terminée');
    check.textContent = todo.completed ? '✓' : '';
    check.onclick = async () => {
        await updateTodo(todo.id, { completed: !todo.completed });
        void refresh();
    };

    const content = document.createElement('div');
    content.className = 'content';
    const titleEl = document.createElement('span');
    titleEl.className = 'item-title';
    titleEl.textContent = todo.title;
    content.appendChild(titleEl);
    if (todo.description) {
        const descEl = document.createElement('span');
        descEl.className = 'item-desc';
        descEl.textContent = todo.description;
        content.appendChild(descEl);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(
        makeButton('Modifier', 'btn btn-ghost btn-sm', () => {
            editingId = todo.id;
            render();
        }),
        makeButton('Supprimer', 'btn btn-danger btn-sm', () => remove(todo.id))
    );

    li.append(check, content, actions);
    return li;
}

function render(): void {
    const stats = countStats(todos);
    el('subtitle').textContent = formatSubtitle(stats);

    const visible = filterTodos(todos, filter);
    const content = el('content');
    content.innerHTML = '';

    if (visible.length === 0) {
        const msg = emptyMessage(filter);
        const div = document.createElement('div');
        div.className = 'empty';
        const span = document.createElement('span');
        span.className = 'emoji';
        span.textContent = msg.emoji;
        div.append(span, document.createTextNode(msg.text));
        content.appendChild(div);
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'list';
    visible.forEach(todo => ul.appendChild(renderItem(todo)));
    content.appendChild(ul);
}

function remove(id: number): void {
    removingIds.add(id);
    render();
    setTimeout(async () => {
        await deleteTodo(id);
        removingIds.delete(id);
        void refresh();
    }, 220);
}

el('addForm').addEventListener('submit', async e => {
    e.preventDefault();
    const input = el('titleInput') as HTMLInputElement;
    const title = input.value.trim();
    if (!isValidTitle(title)) return;
    await createTodo({ title, description: '' });
    input.value = '';
    void refresh();
});

el('filters').addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest('.chip') as HTMLElement | null;
    if (!btn) return;
    filter = btn.dataset.filter as Filter;
    document
        .querySelectorAll('.chip')
        .forEach(c => c.classList.toggle('active', c === btn));
    render();
});

void refresh();