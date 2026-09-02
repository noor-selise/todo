import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, listTodos, setTodoCompleted } from "./todosApi";
import type { Todo, TodoInput } from "./todosApi";

export function useTodosQuery() {
  return useQuery({ queryKey: ["todos"], queryFn: listTodos });
}

export function useTodoMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["todos"] });

  return {
    create: useMutation({ mutationFn: (input: TodoInput) => createTodo(input), onSuccess: invalidate }),
    setCompleted: useMutation({
      mutationFn: ({ todo, isCompleted }: { todo: Todo; isCompleted: boolean }) => setTodoCompleted(todo, isCompleted),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (todo: Todo) => deleteTodo(todo), onSuccess: invalidate })
  };
}
