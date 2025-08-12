import React from "react";
import { useDroppable } from "@dnd-kit/core";
import DraggableItem from "./SortableItem";

export default function DroppableCategory({ id, items, results, submitted }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const getItemBackground = (itemId) => {
    if (!submitted || !results) return 'bg-white';
    
    const result = results.results.find(r => r.id === itemId);
    if (!result) return 'bg-white';
    
    return result.isCorrect ? 'bg-green-100' : 'bg-red-100';
  };

  return (
    <div
      ref={setNodeRef}
      className={`border-2 rounded-lg p-4 ${isOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
    >
      <h3 className="font-semibold text-lg mb-3">{id}</h3>
      <div className="space-y-2">
        {items.map(item => (
          <DraggableItem 
            key={item.id} 
            id={item.id} 
            item={item}
            disabled={submitted}
            className={getItemBackground(item.id)}
          />
        ))}
      </div>
    </div>
  );
}