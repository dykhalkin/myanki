import React, { useState, useEffect } from 'react';
import {
  Plus,
  Settings,
  Play,
  RotateCw,
  Check,
  X,
  Edit3,
  Layout,
  Eye,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react';

// --- API CONFIGURATION ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const generateGeminiContent = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

// --- MOCK DATA & UTILS ---

const INITIAL_FIELDS = [
  { id: 'f1', name: 'Word', type: 'text', label: 'Word (Target Lang)', isPrimary: true },
  { id: 'f2', name: 'Translation', type: 'text', label: 'Translation (Native)' },
  { id: 'f3', name: 'Context', type: 'textarea', label: 'Context / Example' },
  {
    id: 'f4',
    name: 'Gender',
    type: 'select',
    label: 'Gender / Category',
    options: ['Der', 'Die', 'Das', 'Plural'],
  },
  { id: 'f5', name: 'Notes', type: 'textarea', label: 'Notes (Grammar)' },
];

const INITIAL_TEMPLATE = {
  front: ['f1', 'f4'],
  back: ['f1', 'f4', 'f2', 'f3', 'f5'],
};

// --- COMPONENTS ---

// 1. Template Editor
const TemplateEditor = ({ fields, template, onUpdateTemplate }) => {
  const toggleField = (side, fieldId) => {
    const current = template[side];
    const newSide = current.includes(fieldId)
      ? current.filter((id) => id !== fieldId)
      : [...current, fieldId];
    onUpdateTemplate({ ...template, [side]: newSide });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Layout className="w-5 h-5 text-indigo-500" />
        Card Template Settings
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Configure field visibility.Toggle checkboxes to show / hide fields on each side of the card.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Front Side Config */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold border-b pb-2 mb-2">
            <Eye className="w-4 h-4" /> Front Side(Question)
          </div>
          {fields.map((field) => (
            <div
              key={`front-${field.id}`}
              onClick={() => toggleField('front', field.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                template.front.includes(field.id)
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                  : 'bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                  template.front.includes(field.id)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-slate-300'
                }`}
              >
                {template.front.includes(field.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium"> {field.label} </span>
            </div>
          ))}
        </div>

        {/* Back Side Config */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold border-b pb-2 mb-2">
            <RotateCw className="w-4 h-4" /> Back Side(Answer)
          </div>
          {fields.map((field) => (
            <div
              key={`back-${field.id}`}
              onClick={() => toggleField('back', field.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                template.back.includes(field.id)
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border border-slate-100 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${
                  template.back.includes(field.id)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300'
                }`}
              >
                {template.back.includes(field.id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium"> {field.label} </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Helper to render field content based on type
const FieldRenderer = ({ field, value }) => {
  if (!value) return null;

  if (field.name === 'Gender') {
    const colors = {
      Der: 'bg-blue-100 text-blue-700',
      Die: 'bg-pink-100 text-pink-700',
      Das: 'bg-green-100 text-green-700',
      Plural: 'bg-yellow-100 text-yellow-700',
    };
    return (
      <span
        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${colors[value] || 'bg-gray-100 text-gray-700'}`}
      >
        {value}
      </span>
    );
  }

  if (field.name === 'Word') {
    return (
      <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight text-center break-words w-full">
        {' '}
        {value}{' '}
      </h2>
    );
  }

  if (field.name === 'Translation') {
    return (
      <div className="relative w-full text-center">
        <div className="h-px w-12 bg-slate-200 mx-auto mb-4"> </div>
        <p className="text-xl sm:text-2xl text-slate-600 font-serif italic break-words">
          {' '}
          {value}{' '}
        </p>
      </div>
    );
  }

  if (field.name === 'Context') {
    return (
      <div className="w-full mt-2 bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-400 text-left shadow-sm">
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium break-words">
          {' '}
          "{value}"{' '}
        </p>
      </div>
    );
  }

  if (field.name === 'Notes') {
    return (
      <div className="text-sm text-slate-400 mt-2 bg-slate-50 px-3 py-1 rounded border border-slate-100 max-w-full break-words">
        💡 {value}
      </div>
    );
  }

  return <p className="text-slate-500 text-sm mt-2 break-words"> {value} </p>;
};

// Reusable Card Face Component for Grid Layout
const CardFaceContent = ({
  fields,
  fieldIds,
  data,
  isBack,
  onAskAI,
  aiExplanation,
  isExplaining,
}) => {
  return (
    <div
      data-testid={isBack ? 'back-face' : 'front-face'}
      className={`w-full h-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden [backface-visibility:hidden] ${isBack ? '[transform:rotateY(180deg)]' : ''}`}
    >
      <div className="w-full h-full overflow-y-auto custom-scrollbar p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg flex flex-col items-center gap-6">
          {fieldIds.map((fieldId) => {
            const field = fields.find((f) => f.id === fieldId);
            return <FieldRenderer key={fieldId} field={field} value={data[fieldId]} />;
          })}

          {isBack && (
            <div className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
              {!aiExplanation ? (
                <button
                  onClick={onAskAI}
                  disabled={isExplaining}
                  className="w-full py-2 px-4 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-100 transition"
                >
                  {isExplaining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isExplaining ? 'AI is thinking...' : 'Explain Grammar with AI'}
                </button>
              ) : (
                <div className="bg-indigo-50 rounded-xl p-4 text-left border border-indigo-100 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> AI Tutor
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {' '}
                    {aiExplanation}{' '}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isBack && (
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
          <span className="text-slate-400 text-xs uppercase tracking-widest font-bold animate-pulse bg-white/90 px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm border border-slate-100">
            Tap to flip
          </span>
        </div>
      )}
    </div>
  );
};

// 3. Study Mode
const StudySession = ({ cards, fields, template, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const currentCard = cards[currentIndex];

  const handleGrade = () => {
    // Reset AI state when moving to next card
    setAiExplanation(null);
    setIsExplaining(false);

    // SRS Logic placeholder
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((c) => c + 1), 150);
    } else {
      setFinished(true);
    }
  };

  const handleAskAI = async () => {
    if (isExplaining || aiExplanation) return;
    setIsExplaining(true);

    const word = currentCard.data.f1;
    const sentence = currentCard.data.f3;
    const prompt = `Act as a German language tutor. Briefly explain the grammar and usage of the word "${word}" in the context of this sentence: "${sentence}". Keep it concise and helpful for a learner.`;

    try {
      const text = await generateGeminiContent(prompt);
      setAiExplanation(text);
    } catch {
      setAiExplanation("Sorry, I couldn't connect to the AI tutor right now.");
    } finally {
      setIsExplaining(false);
    }
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800"> Session Complete! </h2>
        <p className="text-slate-500"> You reviewed {cards.length} cards today.</p>
        <button
          onClick={onExit}
          className="px-8 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!currentCard) return <div>No cards to review </div>;

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <button
          onClick={onExit}
          className="text-slate-400 hover:text-slate-700 transition p-2 hover:bg-slate-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex gap-1.5">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-indigo-500' : idx < currentIndex ? 'w-2 bg-indigo-200' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>
        <div className="text-sm font-semibold text-slate-400 font-mono">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Card Area (Grid Implementation for Flip) */}
      <div
        className="flex-1 perspective-1000 relative group cursor-pointer min-h-[400px]"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div
          className={`grid grid-cols-1 grid-rows-1 w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
        >
          {/* FRONT FACE - Positioned in Grid Area 1/1 */}
          <div className="col-start-1 row-start-1 w-full h-full [transform-style:preserve-3d]">
            <CardFaceContent
              fields={fields}
              fieldIds={template.front}
              data={currentCard.data}
              isBack={false}
              onAskAI={undefined}
              aiExplanation={undefined}
              isExplaining={undefined}
            />
          </div>

          {/* BACK FACE - Positioned in Grid Area 1/1 */}
          <div className="col-start-1 row-start-1 w-full h-full [transform-style:preserve-3d]">
            <CardFaceContent
              fields={fields}
              fieldIds={template.back}
              data={currentCard.data}
              isBack={true}
              onAskAI={handleAskAI}
              aiExplanation={aiExplanation}
              isExplaining={isExplaining}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        className={`mt-8 grid grid-cols-4 gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <button
          onClick={() => handleGrade('again')}
          className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="text-red-600 font-bold mb-1"> Again </div>
          <div className="text-xs text-slate-400 group-hover:text-red-400 font-medium"> 1m </div>
        </button>
        <button
          onClick={() => handleGrade('hard')}
          className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="text-orange-600 font-bold mb-1"> Hard </div>
          <div className="text-xs text-slate-400 group-hover:text-orange-400 font-medium">
            {' '}
            10m{' '}
          </div>
        </button>
        <button
          onClick={() => handleGrade('good')}
          className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-green-200 hover:bg-green-50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="text-green-600 font-bold mb-1"> Good </div>
          <div className="text-xs text-slate-400 group-hover:text-green-400 font-medium"> 1d </div>
        </button>
        <button
          onClick={() => handleGrade('easy')}
          className="group p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
        >
          <div className="text-blue-600 font-bold mb-1"> Easy </div>
          <div className="text-xs text-slate-400 group-hover:text-blue-400 font-medium"> 4d </div>
        </button>
      </div>
    </div>
  );
};

// 4. Main App & Dashboard
export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, study, editor, settings
  const [cards, setCards] = useState<any[]>([]); // Start empty, fetch on load
  const [template, setTemplate] = useState(INITIAL_TEMPLATE);

  // Fetch cards from backend
  useEffect(() => {
    fetch('/api/cards')
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch((err) => console.error('Failed to fetch cards:', err));
  }, []);

  // New Card State
  const [newCardData, setNewCardData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddCard = async () => {
    if (!newCardData.f1) return;

    // Optimistic UI update or wait for server? Let's wait for server for simplicity and consistency
    try {
      const newCardPayload = {
        deckId: 'd1',
        data: newCardData,
        status: 'new',
        nextReview: Date.now(),
      };

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardPayload),
      });

      if (!response.ok) throw new Error('Failed to save card');

      const savedCard = await response.json();
      setCards([...cards, savedCard]);
      setNewCardData({});
      alert('Card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card.');
    }
  };

  const handleAutoFill = async () => {
    const word = newCardData.f1;
    if (!word) {
      alert('Please enter a word first.');
      return;
    }

    setIsGenerating(true);
    const prompt = `
      I need to create a flashcard for the German word "${word}". 
      Please provide a JSON object with the following fields:
      - "f2": English translation of the word.
      - "f3": A common, natural German sentence using the word as context.
      - "f4": The gender (Der, Die, Das) or 'Plural' if applicable.
      - "f5": A very short note (max 10 words) about grammar, etymology, or usage.
      
      Respond ONLY with the JSON object, no markdown formatting.
    `;

    try {
      const result = await generateGeminiContent(prompt);
      // Clean up markdown if present
      const cleanResult = result
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleanResult);

      setNewCardData((prev) => ({
        ...prev,
        f1: word, // keep original word
        f2: parsed.f2,
        f3: parsed.f3,
        f4: parsed.f4,
        f5: parsed.f5,
      }));
    } catch {
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'study':
        return (
          <StudySession
            cards={cards}
            fields={INITIAL_FIELDS}
            template={template}
            onExit={() => setView('dashboard')}
          />
        );

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView('dashboard')}
                className="mr-4 p-2 hover:bg-slate-100 rounded-full transition"
              >
                {' '}
                <ArrowLeft className="w-5 h-5 text-slate-600" />{' '}
              </button>
              <h1 className="text-2xl font-bold text-slate-800"> Deck Settings </h1>
            </div>
            <TemplateEditor
              fields={INITIAL_FIELDS}
              template={template}
              onUpdateTemplate={setTemplate}
            />

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setView('dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-medium transition shadow-sm"
              >
                {' '}
                Save Changes{' '}
              </button>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setView('dashboard')}
                className="mr-4 p-2 hover:bg-slate-100 rounded-full transition"
              >
                {' '}
                <ArrowLeft className="w-5 h-5 text-slate-600" />{' '}
              </button>
              <h1 className="text-2xl font-bold text-slate-800"> Add New Card </h1>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none">
                {' '}
              </div>

              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    {' '}
                    Word(Target Lang){' '}
                  </label>
                  <button
                    onClick={handleAutoFill}
                    disabled={isGenerating || !newCardData.f1}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {isGenerating ? 'Generating...' : 'Auto-fill with AI'}
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full p-4 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
                  placeholder="e.g. Fernweh"
                  value={newCardData.f1 || ''}
                  onChange={(e) => setNewCardData({ ...newCardData, f1: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-2 ml-1">
                  ✨ Type a word and click "Auto-fill" to let AI generate the rest.
                </p>
              </div>

              {INITIAL_FIELDS.filter((f) => f.id !== 'f1').map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {' '}
                    {field.label}{' '}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-y min-h-[100px]"
                      rows={3}
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                      value={newCardData[field.id] || ''}
                      onChange={(e) =>
                        setNewCardData({ ...newCardData, [field.id]: e.target.value })
                      }
                    />
                  ) : field.type === 'select' ? (
                    <div className="flex gap-2">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setNewCardData({ ...newCardData, [field.id]: opt })}
                          className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition ${
                            newCardData[field.id] === opt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                      value={newCardData[field.id] || ''}
                      onChange={(e) =>
                        setNewCardData({ ...newCardData, [field.id]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleAddCard}
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200/50 mt-4"
              >
                Add to Deck
              </button>
            </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {' '}
                  Flashcard Forge{' '}
                </h1>
                <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                  Automated Learning Flow
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Powered
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setView('editor')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Card
                </button>
                <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Deck Card */}
              <div className="bg-white group p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <button
                    aria-label="Edit Template"
                    onClick={() => setView('settings')}
                    className="text-slate-300 hover:text-indigo-500 transition p-1 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2"> German B1(Core) </h3>
                <div className="flex justify-between text-sm text-slate-500 mb-6 font-medium">
                  <span>{cards.length} cards </span>
                  <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">
                    {' '}
                    15 due{' '}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setView('study')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-indigo-100 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" /> Study Now
                  </button>
                </div>
              </div>

              {/* Add New Deck Placeholder */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-slate-50 transition cursor-pointer min-h-[260px] group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium"> Create New Deck </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <main className="container mx-auto px-6 py-8 flex-1 flex flex-col">{renderContent()}</main>
    </div>
  );
}
