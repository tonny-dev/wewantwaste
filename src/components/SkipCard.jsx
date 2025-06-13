import React from "react";

export default function SkipCard({ skip, isSelected, onSelect }) {
  if (!skip) return null;

  const {
    id,
    size,
    hire_period_days,
    price_before_vat,
    vat,
    allowed_on_road,
    allows_heavy_waste,
  } = skip;

  const totalPrice = price_before_vat + (price_before_vat * vat) / 100;

  // Different color schemes based on size
  const getColorScheme = (size) => {
    if (size <= 6) return "emerald";
    if (size <= 10) return "blue";
    if (size <= 16) return "purple";
    return "orange";
  };

  const colorScheme = getColorScheme(size);
  const colors = {
    emerald: {
      gradient: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      ring: "ring-emerald-400",
    },
    blue: {
      gradient: "from-blue-400 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      ring: "ring-blue-400",
    },
    purple: {
      gradient: "from-purple-400 to-pink-500",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      ring: "ring-purple-400",
    },
    orange: {
      gradient: "from-orange-400 to-red-500",
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      ring: "ring-orange-400",
    },
  };

  const currentColors = colors[colorScheme];

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
        isSelected ? "scale-[1.02]" : ""
      }`}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${
          isSelected
            ? `ring-4 ${currentColors.ring} ring-opacity-40 shadow-2xl ${currentColors.border}`
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 z-10">
            <div
              className={`w-8 h-8 bg-gradient-to-r ${currentColors.gradient} rounded-full flex items-center justify-center shadow-lg`}
            >
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
          </div>
        )}

        {/* Header with skip size */}
        <div
          className={`px-6 py-8 bg-gradient-to-br ${currentColors.gradient} text-white relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white rounded-full"></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="text-4xl md:text-5xl font-black mb-2">{size}</div>
            <div className="text-sm md:text-base font-medium opacity-90">
              Cubic Yards
            </div>
          </div>
        </div>

        {/* Skip visualization */}
        <div className="px-6 py-4 bg-gray-50 relative">
          <div className="flex justify-center">
            <div
              className={`relative w-20 h-12 bg-gradient-to-b ${currentColors.gradient} rounded-lg shadow-inner overflow-hidden`}
            >
              <div className="absolute inset-1 bg-gradient-to-b from-white/20 to-transparent rounded"></div>
              <div className="absolute bottom-1 left-1 right-1 h-2 bg-black/10 rounded-sm"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2 font-medium">
            Skip Container
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price display */}
          <div className="text-center space-y-1">
            <div className="text-3xl md:text-4xl font-black text-gray-900">
              £{totalPrice.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              Including {vat}% VAT
            </div>
            <div className="text-xs text-gray-400">
              {hire_period_days} days hire period
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                allowed_on_road
                  ? `${currentColors.bg} ${currentColors.text} border ${currentColors.border}`
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  {allowed_on_road ? "🛣️" : "🚫"}
                </div>
                <div className="text-xs font-semibold">Road Use</div>
              </div>
            </div>
            <div
              className={`flex items-center justify-center p-3 rounded-xl transition-colors ${
                allows_heavy_waste
                  ? `${currentColors.bg} ${currentColors.text} border ${currentColors.border}`
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  {allows_heavy_waste ? "🏗️" : "🚫"}
                </div>
                <div className="text-xs font-semibold">Heavy Waste</div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 ${
              isSelected
                ? `bg-gradient-to-r ${currentColors.gradient} text-white shadow-lg transform scale-105`
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
            }`}
          >
            {isSelected ? "✓ Selected" : "Select Skip"}
          </button>
        </div>

        {/* Popular badge */}
        {(size === 6 || size === 8) && (
          <div className="absolute top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-6 py-2 rounded-full transform -rotate-12 shadow-lg">
            Most Popular
          </div>
        )}
      </div>
    </div>
  );
}
