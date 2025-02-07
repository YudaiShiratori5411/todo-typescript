// カテゴリの型定義
interface Category {
    id: number;
    name: string;
}

// 優先順位の型定義
type Priority = 'high' | 'medium' | 'low';

// ToDoアイテムの型定義
interface Todo {
    id: number;
    text: string;
    completed: boolean;
    isEditing: boolean;
    dueDate: Date | null;
    priority: Priority;
    categoryId: number | null;
}

class TodoApp {
    private todos: Todo[] = [];
    private categories: Category[] = [];
    private todoInput: HTMLInputElement;
    private todoList: HTMLUListElement;
    private currentId: number = 1;
    private currentCategoryId: number = 1;
    private readonly STORAGE_KEY = 'todos';
    private readonly CATEGORY_STORAGE_KEY = 'categories';

    constructor() {
        this.todoInput = document.getElementById('todo-input') as HTMLInputElement;
        this.todoList = document.getElementById('todo-list') as HTMLUListElement;

        // LocalStorageからデータを読み込む
        this.loadFromLocalStorage();
        this.loadCategoriesFromLocalStorage();

        const form = document.getElementById('todo-form') as HTMLFormElement;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // カテゴリ管理用のUIを初期化
        this.initializeCategoryUI();
    }

    // LocalStorageからデータを読み込む
    private loadFromLocalStorage(): void {
        const savedTodos = localStorage.getItem(this.STORAGE_KEY);
        if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            this.todos = parsedTodos.map((todo: any) => ({
                ...todo,
                dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
                isEditing: false
            }));

            // 最大のIDを取得して、currentIdを設定
            const maxId = Math.max(...this.todos.map(todo => todo.id), 0);
            this.currentId = maxId + 1;

            this.renderTodos();
        }
    }

    private loadCategoriesFromLocalStorage(): void {
        const savedCategories = localStorage.getItem(this.CATEGORY_STORAGE_KEY);
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
            const maxId = Math.max(...this.categories.map(cat => cat.id), 0);
            this.currentCategoryId = maxId + 1;
        }
    }

    // LocalStorageにデータを保存
    private saveToLocalStorage(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    }

    private saveCategoriestoLocalStorage(): void {
        localStorage.setItem(this.CATEGORY_STORAGE_KEY, JSON.stringify(this.categories));
    }

    private initializeCategoryUI(): void {
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container';

        // カテゴリ追加フォーム
        const categoryForm = document.createElement('form');
        categoryForm.className = 'category-form';
        categoryForm.innerHTML = `
            <input type="text" id="category-input" placeholder="新しいカテゴリを入力">
            <button type="submit">カテゴリを追加</button>
        `;

        // カテゴリリスト
        const categoryList = document.createElement('div');
        categoryList.id = 'category-list';

        categoryContainer.appendChild(categoryForm);
        categoryContainer.appendChild(categoryList);

        // ToDoフォームの前に挿入
        const todoForm = document.getElementById('todo-form');
        todoForm?.parentNode?.insertBefore(categoryContainer, todoForm);

        // カテゴリ追加のイベントリスナー
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('category-input') as HTMLInputElement;
            this.addCategory(input.value.trim());
            input.value = '';
        });

        this.renderCategories();
    }

    private addTodo(): void {
        const todoText = this.todoInput.value.trim();
        const dueDateInput = document.getElementById('due-date') as HTMLInputElement;
        const prioritySelect = document.getElementById('priority-select') as HTMLSelectElement;
        const categorySelect = document.getElementById('category-select') as HTMLSelectElement;

        if (todoText) {
            const todo: Todo = {
                id: this.currentId++,
                text: todoText,
                completed: false,
                isEditing: false,
                dueDate: dueDateInput.value ? new Date(dueDateInput.value) : null,
                priority: prioritySelect.value as Priority,
                categoryId: categorySelect.value ? Number(categorySelect.value) : null
            };

            this.todos.push(todo);
            this.saveToLocalStorage();
            this.renderTodo(todo);
            this.todoInput.value = '';
            dueDateInput.value = '';
        }
    }

    private addCategory(name: string): void {
        if (name) {
            const category: Category = {
                id: this.currentCategoryId++,
                name
            };
            this.categories.push(category);
            this.saveCategoriestoLocalStorage();
            this.renderCategories();
        }
    }

    private renderCategories(): void {
        const categoryList = document.getElementById('category-list');
        if (categoryList) {
            categoryList.innerHTML = '';

            // すべてのカテゴリを表示
            const allButton = document.createElement('button');
            allButton.textContent = 'すべて';
            allButton.className = 'category-btn active';
            allButton.addEventListener('click', () => this.filterByCategory(null));
            categoryList.appendChild(allButton);

            // 各カテゴリボタンを作成
            this.categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category.name;
                button.className = 'category-btn';
                button.addEventListener('click', () => this.filterByCategory(category.id));
                categoryList.appendChild(button);
            });
        }

        // カテゴリ選択肢をToDoフォームに追加
        this.updateCategorySelect();
    }

    private updateCategorySelect(): void {
        const todoForm = document.getElementById('todo-form');
        let categorySelect = document.getElementById('category-select') as HTMLSelectElement;

        if (!categorySelect) {
            categorySelect = document.createElement('select');
            categorySelect.id = 'category-select';
            todoForm?.insertBefore(categorySelect, todoForm.lastElementChild);
        }

        categorySelect.innerHTML = `
            <option value="">カテゴリなし</option>
            ${this.categories.map(cat =>
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('')}
        `;
    }

    private renderTodo(todo: Todo): void {
        const li = document.createElement('li');
        li.className = 'todo-item';

        if (todo.isEditing) {
            // 編集モードの表示
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = todo.text;
            editInput.className = 'edit-input';

            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.value = todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : '';

            // 優先順位選択を追加
            const prioritySelect = document.createElement('select');
            prioritySelect.className = 'priority-select';
            const priorities: Priority[] = ['high', 'medium', 'low'];
            priorities.forEach(p => {
                const option = document.createElement('option');
                option.value = p;
                option.text = `優先度：${p === 'high' ? '高' : p === 'medium' ? '中' : '低'}`;
                option.selected = todo.priority === p;
                prioritySelect.appendChild(option);
            });

            // カテゴリ選択を追加
            const categorySelect = document.createElement('select');
            categorySelect.className = 'edit-category-select';
            categorySelect.innerHTML = `
                <option value="">カテゴリなし</option>
                ${this.categories.map(cat =>
                    `<option value="${cat.id}" ${todo.categoryId === cat.id ? 'selected' : ''}>${cat.name}</option>`
                ).join('')}
            `;

            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.className = 'save-btn';
            saveButton.addEventListener('click', () => {
                this.saveTodoEdit(todo.id, editInput.value, dateInput.value);
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'キャンセル';
            cancelButton.className = 'cancel-btn';
            cancelButton.addEventListener('click', () => {
                this.cancelEdit(todo.id);
            });

            li.appendChild(editInput);
            li.appendChild(dateInput);
            li.appendChild(prioritySelect);
            li.appendChild(categorySelect);
            li.appendChild(saveButton);
            li.appendChild(cancelButton);
        } else {
            // 通常モードの表示
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            const span = document.createElement('span');
            span.textContent = todo.text;
            span.className = todo.completed ? 'completed' : '';

            const dateSpan = document.createElement('span');
            dateSpan.className = 'due-date';
            if (todo.dueDate) {
                const today = new Date();
                const dueDate = new Date(todo.dueDate);
                if (dueDate < today && !todo.completed) {
                    dateSpan.classList.add('overdue');
                }
                dateSpan.textContent = dueDate.toLocaleDateString();
            }

            // 優先順位表示
            const prioritySpan = document.createElement('span');
            prioritySpan.className = `priority-badge priority-${todo.priority}`;
            prioritySpan.textContent = todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低';

            // カテゴリ表示
            const categorySpan = document.createElement('span');
            categorySpan.className = 'category-badge';
            if (todo.categoryId !== null) {
                const category = this.categories.find(c => c.id === todo.categoryId);
                if (category) {
                    categorySpan.textContent = category.name;
                }
            }

            const editButton = document.createElement('button');
            editButton.textContent = '編集';
            editButton.className = 'edit-btn';
            editButton.addEventListener('click', () => {
                this.startEdit(todo.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(dateSpan);
            li.appendChild(prioritySpan);
            li.appendChild(categorySpan);
            li.appendChild(editButton);
            li.appendChild(deleteButton);
        }

        this.todoList.appendChild(li);
    }

    private startEdit(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.isEditing = true;
            this.saveToLocalStorage();
            this.renderTodos();
        }
    }

    private saveTodoEdit(id: number, newText: string, newDate: string): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            const prioritySelect = document.querySelector('.priority-select') as HTMLSelectElement;
            const categorySelect = document.querySelector('.edit-category-select') as HTMLSelectElement;

            todo.text = newText.trim();
            todo.dueDate = newDate ? new Date(newDate) : null;
            todo.priority = prioritySelect.value as Priority;
            todo.categoryId = categorySelect.value ? Number(categorySelect.value) : null;
            todo.isEditing = false;

            this.saveToLocalStorage();
            this.renderTodos();
        }
    }

    private cancelEdit(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.isEditing = false;
            this.renderTodos();
        }
    }

    private toggleTodo(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.renderTodos();
        }
    }

    private deleteTodo(id: number): void {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.renderTodos();
    }

    private filterByCategory(categoryId: number | null): void {
        const buttonElements = document.querySelectorAll('.category-btn');
        const buttons = Array.from(buttonElements);
        
        buttons.forEach(btn => btn.classList.remove('active'));
        
        if (categoryId === null) {
            buttons[0].classList.add('active');
            this.renderTodos();
        } else {
            const activeButton = buttons.find(btn =>
                btn.textContent === this.categories.find(c => c.id === categoryId)?.name
            );
            if (activeButton) {
                activeButton.classList.add('active');
            }
            this.renderFilteredTodos(categoryId);
        }
    }

    private renderFilteredTodos(categoryId: number): void {
        this.todoList.innerHTML = '';
        this.todos
            .filter(todo => todo.categoryId === categoryId)
            .forEach(todo => this.renderTodo(todo));
    }

    private renderTodos(): void {
        this.todoList.innerHTML = '';
        this.todos.forEach(todo => this.renderTodo(todo));
    }
}

// アプリケーションの初期化
window.addEventListener('load', () => {
    new TodoApp();
});