import { blocksClient } from "../../lib/blocks/client";

export type Todo = Record<string, unknown> & {
  itemId?: string;
  id?: string;
  title?: string;
  description?: string;
  isCompleted?: boolean;
  createdDate?: string;
};

export type TodoInput = { title: string; description?: string };

const todos = blocksClient.data.collection<Todo>("Todo", {
  fields: ["title", "description", "isCompleted", "CreatedDate"]
});

export async function listTodos() {
  const response = await todos.list({ pageNo: 1, pageSize: 100, sort: { CreatedDate: -1 } });
  return normalizeTodoList(response);
}

export function createTodo(input: TodoInput) {
  return todos.create({ ...input, isCompleted: false });
}

export function setTodoCompleted(todo: Todo, isCompleted: boolean) {
  return todos.update(todoId(todo), { isCompleted });
}

export function deleteTodo(todo: Todo) {
  return todos.delete(todoId(todo));
}

function todoId(todo: Todo): string {
  const id = todo.itemId ?? todo.id;
  if (!id) throw new Error("Todo item id is missing.");
  return String(id);
}

function normalizeTodoList(response: unknown): { items: Todo[]; totalCount: number } {
  const record = response as {
    data?: { getTodos?: { items?: Todo[]; totalCount?: number }; items?: Todo[]; totalCount?: number };
    items?: Todo[];
    totalCount?: number;
  };
  const gateway = record.data?.getTodos;
  const items = gateway?.items ?? record.data?.items ?? record.items ?? [];
  return { items, totalCount: gateway?.totalCount ?? record.data?.totalCount ?? record.totalCount ?? items.length };
}
