import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import DraggableItem from "./SortableItem";
import DroppableCategory from "./DroppableCategory";

export default function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [itemsInCategories, setItemsInCategories] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const url = id 
          ? `http://localhost:5000/api/questions/${id}`
          : 'http://localhost:5000/api/questions/latest';
        const res = await fetch(url);
        const data = await res.json();
        
        setQuestion(data);
        
        // Initialize empty categories
        const initialCategories = {};
        data.categories.forEach(cat => {
          initialCategories[cat] = [];
        });
        setItemsInCategories(initialCategories);
      } catch (err) {
        console.error("Error fetching question:", err);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) {
      setActiveId(null);
      return;
    }
    
    // Find which category the item is currently in (if any)
    let currentCategory = null;
    Object.entries(itemsInCategories).forEach(([cat, items]) => {
      if (items.some(item => item.id === activeId)) {
        currentCategory = cat;
      }
    });

    // If dropping into a category
    if (question.categories.includes(overId)) {
      setItemsInCategories(prev => {
        const newState = { ...prev };
        
        // Remove from current category if it's in one
        if (currentCategory) {
          newState[currentCategory] = newState[currentCategory].filter(item => item.id !== activeId);
        }
        
        // Add to the new category
        const activeItem = question.items.find(item => item.id === activeId);
        if (activeItem) {
          newState[overId] = [...newState[overId], activeItem];
        }
        
        return newState;
      });
    } 
    // If dropping back to items area (overId is not a category)
    else {
      setItemsInCategories(prev => {
        const newState = { ...prev };
        
        // Remove from current category if it's in one
        if (currentCategory) {
          newState[currentCategory] = newState[currentCategory].filter(item => item.id !== activeId);
        }
        
        return newState;
      });
    }
    
    setActiveId(null);
  };

  const handleSubmit = async () => {
    try {
      const itemsToCheck = [];
      
      Object.keys(itemsInCategories).forEach(category => {
        itemsInCategories[category].forEach(item => {
          itemsToCheck.push({
            id: item.id,
            category: category
          });
        });
      });
      
      const res = await fetch(`http://localhost:5000/api/questions/${question._id}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToCheck }),
      });
      
      const data = await res.json();
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      console.error("Error checking answers:", err);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setResults(null);
    const resetCategories = {};
    question.categories.forEach(cat => {
      resetCategories[cat] = [];
    });
    setItemsInCategories(resetCategories);
  };

  if (!question) return <div className="text-center py-8">Loading quiz...</div>;

  const activeItem = question.items.find(item => item.id === activeId);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
          {question.title}
        </h1>
        
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Items Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Items to Categorize</h2>
              <div className="space-y-3">
                <SortableContext items={question.items}>
                  {question.items.map(item => {
                    // Check if item is already in a category
                    const isInCategory = Object.values(itemsInCategories)
                      .flat()
                      .some(catItem => catItem.id === item.id);
                    
                    if (!isInCategory) {
                      return (
                        <DraggableItem 
                          key={item.id} 
                          id={item.id} 
                          item={item}
                          disabled={submitted}
                        />
                      );
                    }
                    return null;
                  })}
                </SortableContext>
              </div>
            </div>
            
            {/* Categories Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Categories</h2>
              <div className="space-y-6">
                {question.categories.map(category => (
                  <DroppableCategory 
                    key={category} 
                    id={category}
                    items={itemsInCategories[category] || []}
                    results={results}
                    submitted={submitted}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DragOverlay>
            {activeItem ? (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg cursor-grabbing">
                {activeItem.text}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
        <div className="mt-8 flex justify-center gap-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={Object.values(itemsInCategories).flat().length !== question.items.length}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-medium disabled:bg-gray-400"
            >
              Check Answers
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/editor')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium"
              >
                Create New Quiz
              </button>
            </>
          )}
        </div>
        
        {submitted && results && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Results: {results.score}/{results.total} ({results.percentage}%)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {question.categories.map(category => (
                <div key={category} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3">{category}</h3>
                  <ul className="space-y-2">
                    {results.results
                      .filter(result => result.givenCategory === category)
                      .map((result, i) => (
                        <li 
                          key={i} 
                          className={`p-2 rounded ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
                        >
                          <span className="font-medium">{result.text}</span>
                          {!result.isCorrect && (
                            <span className="text-sm text-gray-600 ml-2">
                              (Correct: {result.correctCategory})
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}