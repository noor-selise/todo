import { useState } from "react";
import type { FormEvent } from "react";
import { CheckSquare, Plus, Square, Trash2 } from "lucide-react";
import { useHasRole } from "../access/usePermission";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { ActionButton } from "../../shared/ui/ActionButton";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { DataTable } from "../../shared/ui/DataTable";
import type { Column } from "../../shared/ui/DataTable";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorState } from "../../shared/ui/ErrorState";
import { Modal } from "../../shared/ui/Modal";
import { FormField } from "../../shared/ui/FormField";
import { PageHeader } from "../../shared/ui/PageHeader";
import { Skeleton } from "../../shared/ui/Skeleton";
import { useTodoMutations, useTodosQuery } from "./useTodos";
import type { Todo } from "./todosApi";

export function TodosPage() {
  const { t } = useT();
  const isAdmin = useHasRole("admin");
  const todosQuery = useTodosQuery();
  const { create, remove, setCompleted } = useTodoMutations();
  const [isAdding, setIsAdding] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);

  const items = todosQuery.data?.items ?? [];

  const columns: Column<Todo>[] = [
    {
      key: "done",
      header: t("todos.column.done", "Done"),
      render: (todo) => (
        <button
          className="icon-button"
          aria-label={todo.isCompleted ? "Mark as not done" : "Mark as done"}
          onClick={() => setCompleted.mutate({ todo, isCompleted: !todo.isCompleted })}
          disabled={setCompleted.isPending}
        >
          {todo.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>
      )
    },
    {
      key: "title",
      header: t("todos.column.title", "Title"),
      render: (todo) => <span style={todo.isCompleted ? { textDecoration: "line-through" } : undefined}>{todo.title}</span>
    },
    {
      key: "description",
      header: t("todos.column.description", "Description"),
      render: (todo) => <span className="muted">{todo.description || "—"}</span>
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: t("todos.column.actions", "Actions"),
            render: (todo: Todo) => (
              <div className="row-actions">
                <button className="icon-button" aria-label="Delete" onClick={() => setPendingDelete(todo)}>
                  <Trash2 size={16} />
                </button>
              </div>
            )
          } satisfies Column<Todo>
        ]
      : [])
  ];

  return (
    <section>
      <PageHeader
        title={t("todos.title", "Todos")}
        subtitle={t("todos.subtitle", "Track what needs to get done.")}
        actions={
          <ActionButton icon={<Plus size={16} />} onClick={() => setIsAdding(true)}>
            {t("todos.add", "Add todo")}
          </ActionButton>
        }
      />

      {todosQuery.isLoading ? (
        <div className="table-shell">
          <div style={{ display: "grid", gap: 12, padding: 16 }}>
            <Skeleton className="skeleton-line" />
            <Skeleton className="skeleton-line" />
            <Skeleton className="skeleton-line" />
          </div>
        </div>
      ) : todosQuery.isError ? (
        <ErrorState message={t("common.error", "Something went wrong")} onRetry={() => todosQuery.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t("todos.empty.title", "No todos yet")}
          description={t("todos.empty.description", "Add your first todo to get started.")}
        />
      ) : (
        <DataTable columns={columns} rows={items} />
      )}

      {!isAdmin ? (
        <p className="muted">{t("todos.deleteHint", "Only an admin can delete todos.")}</p>
      ) : null}

      {isAdding ? (
        <AddTodoModal
          isPending={create.isPending}
          onClose={() => setIsAdding(false)}
          onSubmit={(input) => {
            create.mutate(input, { onSuccess: () => setIsAdding(false) });
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title={t("todos.deleteConfirm.title", "Delete todo")}
          message={`Delete "${pendingDelete.title}"? This cannot be undone.`}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            remove.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
          }}
        />
      ) : null}
    </section>
  );
}

function AddTodoModal({
  isPending,
  onClose,
  onSubmit
}: {
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: { title: string; description?: string }) => void;
}) {
  const { t } = useT();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit({ title: trimmed, description: description.trim() || undefined });
  }

  return (
    <Modal title={t("todos.add", "Add todo")} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <FormField
          label={t("todos.column.title", "Title")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
          required
        />
        <FormField
          label={t("todos.column.description", "Description")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="form-actions">
          <button type="button" className="icon-button" onClick={onClose}>
            {t("common.cancel", "Cancel")}
          </button>
          <button type="submit" className="primary-button" disabled={isPending || !title.trim()}>
            {t("common.save", "Save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
