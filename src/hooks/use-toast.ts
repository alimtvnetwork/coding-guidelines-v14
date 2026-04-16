import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

enum ActionType {
  AddToast = "AddToast",
  UpdateToast = "UpdateToast",
  DismissToast = "DismissToast",
  RemoveToast = "RemoveToast",
}

const counter = { value: 0 };

function genId() {
  counter.value = (counter.value + 1) % Number.MAX_SAFE_INTEGER;

  return counter.value.toString();
}

interface AddToastAction {
  type: ActionType.AddToast;
  toast: ToasterToast;
}

interface UpdateToastAction {
  type: ActionType.UpdateToast;
  toast: Partial<ToasterToast>;
}

interface DismissToastAction {
  type: ActionType.DismissToast;
  toastId?: string;
}

interface RemoveToastAction {
  type: ActionType.RemoveToast;
  toastId?: string;
}

type ToastAction =
  | AddToastAction
  | UpdateToastAction
  | DismissToastAction
  | RemoveToastAction;

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {

  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: ActionType.RemoveToast,
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const handleDismiss = (state: State, toastId?: string) => {

  if (toastId) {
    addToRemoveQueue(toastId);
  } else {
    state.toasts.forEach((t) => {
      addToRemoveQueue(t.id);
    });
  }

};

const buildDismissed = (state: State, toastId?: string): State => ({
  ...state,
  toasts: state.toasts.map((t) =>
    t.id === toastId || toastId === undefined
      ? { ...t, open: false }
      : t,
  ),
});

const handleRemove = (state: State, toastId?: string): State => {

  if (toastId === undefined) {
    return { ...state, toasts: [] };
  }

  return {
    ...state,
    toasts: state.toasts.filter((t) => t.id !== toastId),
  };
};

export const reducer = (state: State, action: ToastAction): State => {
  switch (action.type) {
    case ActionType.AddToast:

      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ActionType.UpdateToast:

      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case ActionType.DismissToast: {
      const { toastId } = action;
      handleDismiss(state, toastId);

      return buildDismissed(state, toastId);
    }

    case ActionType.RemoveToast:

      return handleRemove(state, action.toastId);
  }

};

const listeners: Array<(state: State) => void> = [];

const memoryState = { current: { toasts: [] } as State };

function dispatch(action: ToastAction) {
  memoryState.current = reducer(memoryState.current, action);
  listeners.forEach((listener) => {
    listener(memoryState.current);
  });
}

type Toast = Omit<ToasterToast, "id">;

function createToastEntry(id: string, props: Toast) {
  const dismiss = () => dispatch({ type: ActionType.DismissToast, toastId: id });

  dispatch({
    type: ActionType.AddToast,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (isOpen) => {

        if (!isOpen) dismiss();
      },
    },
  });

  return { id, dismiss };
}

function toast({ ...props }: Toast) {
  const id = genId();
  const { dismiss } = createToastEntry(id, props);

  const update = (updateProps: ToasterToast) =>
    dispatch({ type: ActionType.UpdateToast, toast: { ...updateProps, id } });

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState.current);

  React.useEffect(() => {
    listeners.push(setState);

    return () => {
      const index = listeners.indexOf(setState);

      if (index > -1) {
        listeners.splice(index, 1);
      }

    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: ActionType.DismissToast, toastId }),
  };
}

export { useToast, toast };
