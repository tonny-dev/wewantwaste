import React, { useState, useEffect, useRef } from "react";
import { searchAddressesAutocomplete, validatePostcode } from "../api/address";

export default function PostcodeEntry({ onAddressSelected }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editableAddress, setEditableAddress] = useState({
    line1: "",
    line2: "",
    line3: "",
    city: "",
    postcode: "",
  });

  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const results = await searchAddressesAutocomplete(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error("Address search error:", err);
        setError(
          "Failed to search addresses. Please try again or enter manually.",
        );
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle suggestion selection
  const handleSuggestionSelect = (address) => {
    setSelectedAddress(address);
    setEditableAddress({
      line1: address.line1 || address.address_line_1 || "",
      line2: address.line2 || address.address_line_2 || "",
      line3: address.line3 || address.line3 || "",
      city: address.city || "",
      postcode: address.postcode || "",
    });
    setShowSuggestions(false);
    setShowConfirmation(true);
    setQuery(address.full_address);
  };

  // Handle manual address entry
  const handleManualEntry = () => {
    setShowConfirmation(true);
    setEditableAddress({
      line1: "",
      line2: "",
      line3: "",
      city: "",
      postcode: "",
    });
    setShowSuggestions(false);
  };

  // Handle address confirmation
  const handleConfirmAddress = async () => {
    if (!editableAddress.postcode || !editableAddress.city) {
      setError("Please fill in at least the postcode and city");
      return;
    }

    try {
      // Validate postcode
      const isValid = await validatePostcode(editableAddress.postcode);
      if (!isValid) {
        setError("Please enter a valid UK postcode");
        return;
      }

      // Build full address string
      const addressParts = [
        editableAddress.line1,
        editableAddress.line2,
        editableAddress.line3,
        editableAddress.city,
        editableAddress.postcode,
      ].filter((part) => part && part.trim());

      const fullAddress = addressParts.join(", ");

      // Pass the address to parent with both postcode and area
      onAddressSelected({
        postcode: editableAddress.postcode,
        area: editableAddress.city,
        full_address: fullAddress,
        details: editableAddress,
      });

      setError("");
    } catch (err) {
      console.error("Address validation error:", err);
      setError("Failed to validate address. Please check your postcode.");
    }
  };

  // Handle going back to search
  const handleBackToSearch = () => {
    setShowConfirmation(false);
    setSelectedAddress(null);
    setQuery("");
    setEditableAddress({
      line1: "",
      line2: "",
      line3: "",
      city: "",
      postcode: "",
    });
    setError("");
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Address confirmation view
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative px-4 py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                SKIP HIRE
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  With A Difference
                </span>
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
                Confirm your delivery address
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-6">
              <button
                onClick={handleBackToSearch}
                className="flex items-center text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to search
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Your Address
              </h2>
              <p className="text-gray-600">
                Review and edit your delivery address details
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={editableAddress.line1}
                  onChange={(e) =>
                    setEditableAddress({
                      ...editableAddress,
                      line1: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="House number and street name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={editableAddress.line2}
                  onChange={(e) =>
                    setEditableAddress({
                      ...editableAddress,
                      line2: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Area, district (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 3
                </label>
                <input
                  type="text"
                  value={editableAddress.line3}
                  onChange={(e) =>
                    setEditableAddress({
                      ...editableAddress,
                      line3: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Locality (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City/Town *
                </label>
                <input
                  type="text"
                  value={editableAddress.city}
                  onChange={(e) =>
                    setEditableAddress({
                      ...editableAddress,
                      city: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. London, Manchester"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={editableAddress.postcode}
                  onChange={(e) =>
                    setEditableAddress({
                      ...editableAddress,
                      postcode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. SW1A 1AA"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleConfirmAddress}
              disabled={!editableAddress.postcode || !editableAddress.city}
              className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Confirm Address →
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">Version 1.1.36</p>
          </div>
        </div>
      </div>
    );
  }

  // Main search view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              SKIP HIRE
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                With A Difference
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Start typing your address or postcode
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Enter Your Delivery Address
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="relative mb-6" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Start typing your address or postcode..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id || index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full p-4 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl transition-colors"
                  >
                    <p className="font-semibold text-gray-800">
                      {suggestion.full_address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {suggestion.postcode}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleManualEntry}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              <span className="text-lg">📝</span>
              <p className="font-semibold mt-1">Enter address manually</p>
              <p className="text-sm">If you can't find your address</p>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Version 1.1.36</p>
        </div>
      </div>
    </div>
  );
}
