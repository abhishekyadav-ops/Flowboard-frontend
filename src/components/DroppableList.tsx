import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: number;
  children: React.ReactNode;
}

function DroppableList({
  id,
  children,
}: Props) {
  const { setNodeRef } =
    useDroppable({
      id,
    });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

export default DroppableList;