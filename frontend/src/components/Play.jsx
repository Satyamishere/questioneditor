
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCorners, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import DraggableItem from "./SortableItem";
import DroppableCategory from "./DroppableCategory";

export default function Play() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [itemsInCategories, setItemsInCategories] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${id}`);
        const data = await res.json();
        setForm(data);
        const initialAnswers = {};
        data.questions.forEach(q => {
          if (q.type === "categorize") {
            const catMap = {};
            q.categories.forEach(cat => { catMap[cat] = []; });
            initialAnswers[q._id] = catMap;
          } else if (q.type === "comprehension") {
            initialAnswers[q._id] = [];
          }
        });
        setAnswers(initialAnswers);
        // Set up itemsInCategories for the first categorize question (if any)
        const firstCategorize = data.questions.find(q => q.type === "categorize");
        if (firstCategorize) {
          const catMap = {};
          firstCategorize.categories.forEach(cat => { catMap[cat] = []; });
          setItemsInCategories(catMap);
        }
      } catch (err) {
        console.error("Error fetching form:", err);
      }
    };
    fetchForm();
  }, [id]);



  // Drag and drop handlers for categorize
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event, q) => {
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
    let currentCategory = null;
    Object.entries(itemsInCategories).forEach(([cat, items]) => {
      if (items.includes(activeId)) currentCategory = cat;
    });
    const newCatMap = { ...itemsInCategories };
    if (currentCategory) {
      newCatMap[currentCategory] = newCatMap[currentCategory].filter(id => id !== activeId);
    }
    if (q.categories.includes(overId)) {
      newCatMap[overId] = [...newCatMap[overId], activeId];
    }
    setItemsInCategories(newCatMap);
    setActiveId(null);
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

  if (!form) return <div className="text-center py-8">Loading form...</div>;

  const handleCategorizeChange = (qId, cat, itemId, checked) => {
    setAnswers(prev => {
      const newCatMap = { ...prev[qId] };
      if (checked) {
        newCatMap[cat] = [...newCatMap[cat], itemId];
      } else {
        newCatMap[cat] = newCatMap[cat].filter(id => id !== itemId);
      }
      return { ...prev, [qId]: newCatMap };
    });
  };



  const handleComprehensionChange = (qId, idx, value) => {
    setAnswers(prev => {
      const arr = [...prev[qId]];
      arr[idx] = value;
      return { ...prev, [qId]: arr };
    });
  };

  const handleSubmit = async () => {
    try {
      // For categorize questions, use itemsInCategories as the answer
      const mergedAnswers = { ...answers };
      form.questions.forEach(q => {
        if (q.type === "categorize") {
          mergedAnswers[q._id] = itemsInCategories;
        }
      });
      const answerArr = Object.entries(mergedAnswers).map(([questionId, response]) => ({ questionId, response }));
      const res = await fetch(`http://localhost:5000/api/forms/${form._id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerArr }),
      });
      const data = await res.json();
      setResponse(data);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit response");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-blue-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-indigo-700 drop-shadow-lg tracking-tight">{form.title}</h1>
        {form.headerImage && <img src={form.headerImage} alt="Header" className="mx-auto mb-8 max-h-60 rounded-2xl shadow-lg border-2 border-indigo-200" />}
        <form className="space-y-10">
          {form.questions.map((q, qIdx) => (
            <div key={q._id || q.id} className="bg-white p-8 rounded-3xl shadow-2xl mb-10 border border-indigo-100 transition-all hover:shadow-3xl">
              <div className="mb-4 flex items-center gap-4">
                <span className="font-bold text-xl text-pink-600">Q{qIdx + 1} <span className="text-xs text-indigo-400 font-semibold">({q.type})</span></span>
                {q.image && <img src={q.image} alt="Q" className="max-h-16 rounded-lg border border-indigo-100" />}
              </div>
              <div className="mb-4 text-gray-900 text-lg font-medium">{q.text}</div>
              {q.type === "categorize" ? (
                <DndContext
                  collisionDetection={closestCorners}
                  onDragStart={event => setActiveId(event.active.id)}
                  onDragEnd={event => handleDragEnd(event, q)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border-4 border-solid border-indigo-400 shadow-xl flex flex-col items-center min-h-[220px]">
                      <h2 className="text-xl font-bold mb-4 text-indigo-700 tracking-wide uppercase">Items</h2>
                      <SortableContext items={q.items.map(item => item.id)}>
                        {q.items.filter(item => {
                          return !Object.values(itemsInCategories).flat().includes(item.id);
                        }).map(item => (
                          <DraggableItem key={item.id} id={item.id} item={item} disabled={submitted} />
                        ))}
                      </SortableContext>
                    </div>
                    <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-2xl border-4 border-solid border-pink-400 shadow-xl min-h-[220px]">
                      <h2 className="text-xl font-bold mb-4 text-pink-600 tracking-wide uppercase">Categories</h2>
                      <div className="space-y-6">
                        {q.categories.map(category => (
                          <DroppableCategory
                            key={category}
                            id={category}
                            items={q.items.filter(item => itemsInCategories[category]?.includes(item.id))}
                            results={null}
                            submitted={submitted}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg cursor-grabbing">
                        {q.items.find(item => item.id === activeId)?.text}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : null}

              {q.type === "comprehension" && (
                <div className="mb-4">
                  {q.passage && <div className="mb-2 p-2 bg-gray-100 rounded">{q.passage}</div>}
                  <div className="mb-2 font-semibold">Select all correct options:</div>
                  {(q.options && q.options.length > 0 ? q.options : []).map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        disabled={submitted}
                        checked={Array.isArray(answers[q._id]) ? answers[q._id].includes(idx) : false}
                        onChange={e => {
                          setAnswers(prev => {
                            const arr = Array.isArray(prev[q._id]) ? [...prev[q._id]] : [];
                            if (e.target.checked) {
                              arr.push(idx);
                            } else {
                              const i = arr.indexOf(idx);
                              if (i > -1) arr.splice(i, 1);
                            }
                            return { ...prev, [q._id]: arr };
                          });
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </form>
        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-12 py-4 rounded-2xl text-xl font-bold shadow-lg transition-all duration-200"
            disabled={submitted}
          >
            Submit
          </button>
        </div>
        {submitted && response && (
          <div className="mt-12 bg-white p-8 rounded-3xl shadow-2xl text-center border border-indigo-100">
            <h2 className="text-3xl font-extrabold mb-4 text-pink-600 drop-shadow">Thank you for submitting!</h2>
            <div className="text-2xl mb-2 text-indigo-700 font-bold">Score: {response.score} / {response.total}</div>
            <div className="text-xl text-gray-700">Percentage: {response.percentage}%</div>
          </div>
        )}
      </div>
    </div>
  );
}

