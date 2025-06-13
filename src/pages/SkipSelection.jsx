import React, { useEffect, useState } from "react";
import { fetchSkips } from "../api/skips";
import SkipCard from "../components/SkipCard";

export default function SkipSelection({
  onSkipSelected,
  selectedAddress,
  wasteTypes,
  onBack,
}) {
  const [skips, setSkips] = useState([]);
  const [selectedSkipId, setSelectedSkipId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchSkips()
      .then(setSkips)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSkips = skips.filter((skip) => {
    if (filter === "road") return skip.allowed_on_road;
    if (filter === "heavy") return skip.allows_heavy_waste;
    if (filter === "small") return skip.size <= 8;
    if (filter === "large") return skip.size > 8;
    return true;
  });

  const selectedSkip = skips.find((skip) => skip.id === selectedSkipId);

  const filterOptions = [
    { key: "all", label: "All Skips", icon: "📦", count: skips.length },
    {
      key: "small",
      label: "Small (≤8 yd³)",
      icon: "📏",
      count: skips.filter((s) => s.size <= 8).length,
    },
    {
      key: "large",
      label: "Large (>8 yd³)",
      icon: "📐",
      count: skips.filter((s) => s.size > 8).length,
    },
    {
      key: "road",
      label: "Road Permitted",
      icon: "🛣️",
      count: skips.filter((s) => s.allowed_on_road).length,
    },
    {
      key: "heavy",
      label: "Heavy Waste",
      icon: "🏗️",
      count: skips.filter((s) => s.allows_heavy_waste).length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Finding Perfect Skips
          </h3>
          <p className="text-gray-600">
            Searching the best waste disposal solutions for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md mx-auto text-center border border-red-100">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connection Error
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-6xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Skip Hire
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose from our range of professional skip sizes for all your
              waste disposal needs in Lowestoft
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                { label: "Skip Sizes", value: `${skips.length}+`, icon: "📦" },
                { label: "Fast Delivery", value: "24H", icon: "🚚" },
                { label: "Days Hire", value: "14", icon: "📅" },
                { label: "Areas Served", value: "50+", icon: "📍" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6"
                >
                  <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base opacity-75">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Filter Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Choose Your Skip
              </h2>
              <p className="text-gray-600">
                Filter by size, features, or view all available options
              </p>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden mt-4 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-200 flex items-center space-x-2"
            >
              <span>Filters</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Filter buttons */}
          <div className={`${showMobileFilters ? "block" : "hidden"} md:block`}>
            <div className="flex flex-wrap gap-3">
              {filterOptions.map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 px-4 md:px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    filter === key
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200"
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm md:text-base">{label}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      filter === key ? "bg-white/20" : "bg-gray-100"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="mb-8 md:mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  {filteredSkips.length} Skip
                  {filteredSkips.length !== 1 ? "s" : ""} Available
                </h3>
                <p className="text-gray-600">
                  Perfect solutions for your waste disposal needs in NR32
                  Lowestoft
                </p>
              </div>

              {selectedSkip && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-2xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">
                    Currently Selected:
                  </p>
                  <p className="text-lg md:text-xl font-bold text-blue-800">
                    {selectedSkip.size} yd³ Skip - £
                    {(
                      selectedSkip.price_before_vat +
                      (selectedSkip.price_before_vat * selectedSkip.vat) / 100
                    ).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skip Cards Grid */}
        {filteredSkips.length === 0 ? (
          <div className="text-center py-16 md:py-24">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-700 mb-4">
              No Skips Match Your Filters
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Try adjusting your filter options or view all available skips
            </p>
            <button
              onClick={() => setFilter("all")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              View All Skips
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSkips.map((skip) => (
              <SkipCard
                key={skip.id}
                skip={skip}
                isSelected={selectedSkipId === skip.id}
                onSelect={setSelectedSkipId}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        {selectedSkipId && (
          <div className="mt-12 md:mt-16">
            <div className="bg-gradient-to-r from-green-500 via-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black mb-4">
                  Ready to Continue?
                </h3>
                <p className="text-lg md:text-xl mb-2 opacity-90">
                  You've selected the {selectedSkip?.size} yd³ skip
                </p>
                <p className="text-2xl md:text-3xl font-bold mb-8">
                  Total: £
                  {(
                    selectedSkip?.price_before_vat +
                      (selectedSkip?.price_before_vat * selectedSkip?.vat) /
                        100 || 0
                  ).toFixed(2)}{" "}
                  (inc. VAT)
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => onSkipSelected(selectedSkip)}
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Continue to Booking →
                  </button>
                  <button
                    onClick={() => setSelectedSkipId(null)}
                    className="text-white/80 hover:text-white underline transition-colors"
                  >
                    Choose Different Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer section */}
      <footer className="bg-gray-900 text-white py-12 md:py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h4 className="text-2xl md:text-3xl font-bold mb-4">
            Professional Skip Hire Services
          </h4>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Reliable waste disposal solutions for residential and commercial
            needs. Fast delivery, competitive prices, and excellent customer
            service.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { title: "Fast Delivery", desc: "Same day available" },
              { title: "All Sizes", desc: "4-40 cubic yards" },
              { title: "Fair Pricing", desc: "No hidden fees" },
              { title: "Professional", desc: "Licensed & insured" },
            ].map((item, index) => (
              <div key={index}>
                <h5 className="font-semibold mb-2">{item.title}</h5>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
