// ToDoアイテムの型定義
interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

class TodoApp {
    private todos: Todo[] = [];
    private todoInput: HTMLInputElement;
    private todoList: HTMLUListElement;
    private currentId: number = 1;

    constructor() {
        this.todoInput = document.getElementById('todo-input') as HTMLInputElement;
        this.todoList = document.getElementById('todo-list') as HTMLUListElement;
        
        // フォームのサブミットイベントを設定
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
                completed: false
            };
            
            this.todos.push(todo);
            this.renderTodo(todo);
            this.todoInput.value = '';
        }
    }

    private renderTodo(todo: Todo): void {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        // チェックボックスを作成
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            this.toggleTodo(todo.id);
        });

        // テキストを作成
        const span = document.createElement('span');
        span.textContent = todo.text;
        if (todo.completed) {
            span.style.textDecoration = 'line-through';
        }

        // 削除ボタンを作成
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'delete-btn';
        deleteButton.addEventListener('click', () => {
            this.deleteTodo(todo.id);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);
        this.todoList.appendChild(li);
    }

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