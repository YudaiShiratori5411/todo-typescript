// ToDoアイテムの型定義
interface Todo {
    id: number;
    text: string;
    completed: boolean;
    isEditing: boolean;
}

class TodoApp {
    private todos: Todo[] = [];
    private todoInput: HTMLInputElement;
    private todoList: HTMLUListElement;
    private currentId: number = 1;

    constructor() {
        this.todoInput = document.getElementById('todo-input') as HTMLInputElement;
        this.todoList = document.getElementById('todo-list') as HTMLUListElement;
        
        const form = document.getElementById('todo-form') as HTMLFormElement;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });
    }

    private addTodo(): void {
        const todoText = this.todoInput.value.trim();
        if (todoText) {
            const todo: Todo = {
                id: this.currentId++,
                text: todoText,
                completed: false,
                isEditing: false
            };
            
            this.todos.push(todo);
            this.renderTodo(todo);
            this.todoInput.value = '';
        }
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

            const saveButton = document.createElement('button');
            saveButton.textContent = '保存';
            saveButton.className = 'save-btn';
            saveButton.addEventListener('click', () => {
                this.saveTodoEdit(todo.id, editInput.value);
            });

            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'キャンセル';
            cancelButton.className = 'cancel-btn';
            cancelButton.addEventListener('click', () => {
                this.cancelEdit(todo.id);
            });

            li.appendChild(editInput);
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
            li.appendChild(editButton);
            li.appendChild(deleteButton);
        }

        this.todoList.appendChild(li);
    }

    private startEdit(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.isEditing = true;
            this.renderTodos();
        }
    }

    private saveTodoEdit(id: number, newText: string): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            todo.isEditing = false;
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

    // 既存のメソッドはそのまま
    private toggleTodo(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
        }
    }

    private deleteTodo(id: number): void {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
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