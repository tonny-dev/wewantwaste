import React, { useState } from "react";

const PermitCheck = ({
  onPermitCheckComplete,
  selectedAddress,
  selectedSkip,
  onBack,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelect = (locationType) => {
    setSelectedLocation(locationType);
  };

  const handleContinue = () => {
    const permitRequired = selectedLocation === "public";
    const permitDetails = permitRequired
      ? {
          processingTime: 5,
          earliestDate: getEarliestPermitDate(),
        }
      : null;

    onPermitCheckComplete(permitRequired, permitDetails);
  };

  const getEarliestPermitDate = () => {
    const today = new Date();
    const earliestDate = new Date(today);
    earliestDate.setDate(today.getDate() + 7);
    return earliestDate;
  };

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

        <div className="relative px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Skip
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Placement
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Where will the skip be placed? This helps us determine if you need
              a permit
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Private Property Option */}
            <div
              onClick={() => handleLocationSelect("private")}
              className={`cursor-pointer p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 ${
                selectedLocation === "private"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transform scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                    selectedLocation === "private"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                  }`}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    Private Property
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Driveway or private land
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 md:p-6 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center p-3 justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <p className="text-green-700 font-semibold">
                    No permit required when placed on your private property
                  </p>
                </div>
              </div>
            </div>

            {/* Public Road Option */}
            <div
              onClick={() => handleLocationSelect("public")}
              className={`cursor-pointer p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 ${
                selectedLocation === "public"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transform scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mr-4 ${
                    selectedLocation === "public"
                      ? "bg-gradient-to-r from-orange-500 to-red-600"
                      : "bg-gradient-to-r from-gray-400 to-gray-500"
                  }`}
                >
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
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    Public Road
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Council or public property
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 md:p-6 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center p-4 justify-center mr-3">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <p className="text-orange-700 font-semibold">
                    Permit required for placement on public roads
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permit Information */}
          {selectedLocation === "public" && (
            <div className="mb-8 space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 p-6 md:p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full p-6 flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold text-lg">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2 text-xl">
                      Permit Required
                    </h4>
                    <p className="text-yellow-700 text-lg leading-relaxed">
                      A permit is required when placing a skip on a public road.
                      We'll handle the permit application process for you.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 p-6 md:p-8 rounded-2xl">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-3 flex items-center justify-center mr-4 mt-1">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-2 text-xl">
                      Processing Time
                    </h4>
                    <p className="text-blue-700 text-lg leading-relaxed">
                      The council requires 5 working days notice to process
                      permit applications. Please ensure it's accessible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold text-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedLocation}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermitCheck;
