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
      className={`border-4 border-solid rounded-2xl p-6 bg-gradient-to-br from-white to-pink-50 shadow-xl transition-all duration-150 ${isOver ? 'border-indigo-500 bg-indigo-50 scale-105' : 'border-pink-400'} group`}
    >
      <h3 className="font-extrabold text-lg mb-4 text-pink-600 tracking-wide uppercase group-hover:text-indigo-600 transition-all">{id}</h3>
      <div className="space-y-3">
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