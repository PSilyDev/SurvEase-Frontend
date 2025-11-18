import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

export default function Draggable({
  id,
  children,
}: {
  id: string;
  children: (args: {
    setNodeRef: (node: HTMLElement | null) => void;
    attributes: Record<string, any>;
    listeners: Record<string, any>;
    style: React.CSSProperties;
  }) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 5 : "auto",
  };

  return <>{children({ setNodeRef, attributes, listeners, style })}</>;
}
