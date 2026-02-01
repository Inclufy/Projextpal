import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
  disabled?: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children, disabled = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: id.toString(),
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card className={cn(
        'p-4 mb-2',
        isDragging && 'shadow-lg ring-2 ring-purple-500'
      )}>
        <div className="flex items-center gap-3">
          {!disabled && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
};

interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string | number;
  disabled?: boolean;
}

function DraggableList<T>({ 
  items, 
  onReorder, 
  renderItem, 
  getItemId,
  disabled = false 
}: DraggableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => getItemId(item).toString() === active.id);
      const newIndex = items.findIndex(item => getItemId(item).toString() === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => getItemId(item).toString())}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item, index) => (
          <SortableItem 
            key={getItemId(item)} 
            id={getItemId(item)}
            disabled={disabled}
          >
            {renderItem(item, index)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default DraggableList;
export { SortableItem };
