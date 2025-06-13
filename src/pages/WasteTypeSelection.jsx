import React, { useState } from "react";

const wasteTypes = [
  {
    id: "construction",
    title: "Construction Waste",
    description: "Building materials and renovation debris",
    icon: "🏗️",
    selected: false,
  },
  {
    id: "household",
    title: "Household Waste",
    description: "General household items and furniture",
    icon: "🏠",
    selected: false,
  },
  {
    id: "garden",
    title: "Garden Waste",
    description: "Green waste and landscaping materials",
    icon: "🌿",
    selected: false,
  },
  {
    id: "commercial",
    title: "Commercial Waste",
    description: "Business and office clearance",
    icon: "🏢",
    selected: false,
  },
];

export default function WasteTypeSelection({
  onWasteTypeSelected,
  selectedAddress,
}) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleWasteType = (wasteTypeId) => {
    setSelectedTypes((prev) => {
      const newSelection = prev.includes(wasteTypeId)
        ? prev.filter((id) => id !== wasteTypeId)
        : [...prev, wasteTypeId];

      setSelectAll(newSelection.length === wasteTypes.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTypes([]);
      setSelectAll(false);
    } else {
      setSelectedTypes(wasteTypes.map((type) => type.id));
      setSelectAll(true);
    }
  };

  const handleContinue = () => {
    if (selectedTypes.length === 0) {
      alert("Please select at least one waste type");
      return;
    }
    onWasteTypeSelected(selectedTypes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Progress Steps */}
      {/* <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Postcode", icon: "📍", completed: true },
              { step: 2, label: "Waste Type", icon: "🗑️", current: true },
              { step: 3, label: "Select Skip", icon: "📦", upcoming: true },
              { step: 4, label: "Permit Check", icon: "📋", upcoming: true },
              { step: 5, label: "Choose Date", icon: "📅", upcoming: true },
              { step: 6, label: "Payment", icon: "💳", upcoming: true },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                    item.completed
                      ? "bg-green-500 text-white"
                      : item.current
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.completed ? "✓" : item.step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    item.current ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
                {index < 5 && (
                  <div
                    className={`ml-4 w-8 h-0.5 ${
                      item.completed ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            What type of waste are you disposing of?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Select all that apply to help us recommend the best skip size
          </p>

          {selectedAddress && (
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {selectedAddress.postcode} - {selectedAddress.area}
            </div>
          )}
        </div>

        {/* Select All Button */}
        <div className="mb-8">
          <button
            onClick={handleSelectAll}
            className={`flex items-center justify-center w-full p-4 rounded-2xl border-2 border-dashed transition-all ${
              selectAll
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-gray-300 text-gray-600 hover:border-blue-300"
            }`}
          >
            <span className="text-lg mr-3">{selectAll ? "✅" : "☑️"}</span>
            <span className="font-semibold">
              {selectAll ? "Deselect all that apply" : "Select all that apply"}
            </span>
          </button>
        </div>

        {/* Waste Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {wasteTypes.map((wasteType) => (
            <button
              key={wasteType.id}
              onClick={() => toggleWasteType(wasteType.id)}
              className={`p-8 rounded-3xl border-2 transition-all transform hover:scale-105 text-left ${
                selectedTypes.includes(wasteType.id)
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 shadow-md"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{wasteType.icon}</div>
                {selectedTypes.includes(wasteType.id) && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {wasteType.title}
              </h3>
              <p className="text-gray-600">{wasteType.description}</p>
            </button>
          ))}
        </div>

        {/* Selected Waste Types Summary */}
        {selectedTypes.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Selected Waste Types
            </h3>
            <div className="flex flex-wrap gap-3">
              {selectedTypes.map((typeId) => {
                const wasteType = wasteTypes.find((t) => t.id === typeId);
                return (
                  <span
                    key={typeId}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    <span className="mr-2">{wasteType.icon}</span>
                    {wasteType.title}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={selectedTypes.length === 0}
            className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
              selectedTypes.length > 0
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-105 hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {selectedTypes.length === 0
              ? "Select waste types to continue"
              : `Continue with ${selectedTypes.length} waste type${selectedTypes.length > 1 ? "s" : ""} →`}
          </button>
        </div>

        {/* Help section */}
        <div className="mt-12 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Need Help Choosing?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">?</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Mixed Waste?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Select multiple categories if you have different types of
                    waste to dispose of.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Unsure About Size?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Don't worry! We'll recommend the perfect skip size based on
                    your selections.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-bold text-sm">⚠</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Restricted Items
                  </h4>
                  <p className="text-sm text-gray-600">
                    Some items like asbestos, chemicals, and electrical
                    appliances have special requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">📞</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Need Advice?
                  </h4>
                  <p className="text-sm text-gray-600">
                    Call us on 01502 123456 for expert guidance on the best skip
                    for your project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waste type details */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            What Can Go in Each Category?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {wasteTypes.map((wasteType) => (
              <div
                key={wasteType.id}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{wasteType.icon}</span>
                  <h4 className="font-bold text-gray-800">{wasteType.title}</h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {wasteType.id === "construction" && (
                    <>
                      <p>✓ Bricks, concrete, tiles</p>
                      <p>✓ Wood, plasterboard, insulation</p>
                      <p>✓ Metal, pipes, fixtures</p>
                      <p>✗ Asbestos, hazardous materials</p>
                    </>
                  )}
                  {wasteType.id === "household" && (
                    <>
                      <p>✓ Furniture, carpets, textiles</p>
                      <p>✓ General household items</p>
                      <p>✓ Books, toys, decorations</p>
                      <p>✗ Electrical items, batteries</p>
                    </>
                  )}
                  {wasteType.id === "garden" && (
                    <>
                      <p>✓ Grass cuttings, leaves</p>
                      <p>✓ Branches, hedge trimmings</p>
                      <p>✓ Soil, turf, plants</p>
                      <p>✓ Garden furniture, sheds</p>
                    </>
                  )}
                  {wasteType.id === "commercial" && (
                    <>
                      <p>✓ Office furniture, equipment</p>
                      <p>✓ Cardboard, paper, packaging</p>
                      <p>✓ Retail fixtures, displays</p>
                      <p>✗ Confidential documents</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-6 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Next: We'll show you available skips based on your waste type
            selection
          </p>
        </div>
      </div>
    </div>
  );
}
