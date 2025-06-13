import React, { useState, useEffect } from "react";

const DateSelection = ({
  onDateSelected,
  selectedAddress,
  selectedSkip,
  permitRequired,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [collectionDate, setCollectionDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    generateAvailableDates();
  }, [currentMonth, permitRequired]);

  const generateAvailableDates = () => {
    const today = new Date();
    const startDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const minDate = permitRequired
      ? new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days for permit
      : new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days normal

    const dates = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (d >= minDate && d.getDay() !== 0 && d.getDay() !== 6) {
        // Exclude weekends
        dates.push(new Date(d));
      }
    }

    setAvailableDates(dates);

    // Set earliest available date if permit required
    if (permitRequired && dates.length > 0) {
      const earliestDate = new Date(Math.max(minDate, dates[0]));
      if (
        currentMonth.getMonth() === earliestDate.getMonth() &&
        currentMonth.getFullYear() === earliestDate.getFullYear()
      ) {
        // Auto-select if in current view
      }
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Calculate collection date (14 days later)
    const collection = new Date(date);
    collection.setDate(collection.getDate() + 14);
    setCollectionDate(collection);
  };

  const handleContinue = () => {
    if (selectedDate && collectionDate) {
      onDateSelected(selectedDate, "7am-6pm");
    }
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDateAvailable = (date) => {
    return availableDates.some(
      (availableDate) => availableDate.toDateString() === date.toDateString(),
    );
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-24">
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
              Choose Your
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Delivery Date
              </span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
              Select your preferred skip delivery date. We'll aim to deliver
              between 7am and 6pm on your chosen day
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Permit Information */}
        {permitRequired && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 p-4 md:p-6 rounded-xl">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-white font-bold">ℹ</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-800 mb-2 text-xl">
                      Permit Information
                    </h4>
                    <p className="text-blue-700 text-lg leading-relaxed mb-2">
                      You've selected to place your skip on a public road, which
                      requires a council permit. The council needs 5 working
                      days to process permit applications.
                    </p>
                    <p className="text-blue-600 font-semibold text-lg">
                      The earliest available date is Friday 20 June.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Delivery Date
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <span className="text-xl font-bold text-gray-800">
                    {currentMonth.toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-3 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-bold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() =>
                          isDateAvailable(date) && handleDateSelect(date)
                        }
                        disabled={!isDateAvailable(date)}
                        className={`w-full h-full flex items-center justify-center text-sm font-semibold rounded-xl transition-all duration-300 ${
                          selectedDate &&
                          selectedDate.toDateString() === date.toDateString()
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                            : isDateAvailable(date)
                              ? "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-800 hover:shadow-md"
                              : "text-gray-400 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Collection Information */}
          <div className="space-y-6">
            {selectedDate && (
              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
                <h4 className="font-bold text-2xl text-gray-800 mb-6">
                  Delivery & Collection
                </h4>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="text-sm font-semibold text-green-600 mb-2">
                      Delivery Date
                    </div>
                    <div className="font-bold text-xl text-green-800">
                      {formatDate(selectedDate)}
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Between 7am - 6pm
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      Collection Date
                    </div>
                    <div className="font-bold text-xl text-blue-800">
                      {formatDate(collectionDate)}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      14 day hire period
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
              <h4 className="font-bold text-xl text-gray-800 mb-4">
                Important Notes
              </h4>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    We'll collect your skip on the date. Please ensure it's
                    accessible.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>14 day hire period included</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Delivery between 7am and 6pm</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Weekend deliveries not available</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between mt-12">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold text-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ← Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
          >
            Continue to Payment
            <svg
              className="w-5 h-5 ml-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateSelection;
