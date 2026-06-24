import { useDraggable } from "@dnd-kit/core";

interface Props {
  id: number;
  children: React.ReactNode;
}

function DraggableCard({
  id,
  children,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
  });

  const style = {
    transform: transform
      ? `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export default DraggableCard;