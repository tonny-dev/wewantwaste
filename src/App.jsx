import React, { useState } from "react";
import PostcodeEntry from "./pages/PostcodeEntry";
import WasteTypeSelection from "./pages/WasteTypeSelection";
import SkipSelection from "./pages/SkipSelection";
import PermitCheck from "./pages/PermitCheck";
import DateSelection from "./pages/DateSelection";
import Payment from "./pages/Payment";

function App() {
  // Main application state
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    address: null,
    wasteTypes: [],
    selectedSkip: null,
    permitRequired: false,
    permitDetails: null,
    selectedDate: null,
    timeSlot: null,
    paymentDetails: null,
  });

  // Step definitions for progress tracking
  const steps = [
    { step: 1, label: "Address", icon: "📍", component: "postcode" },
    { step: 2, label: "Waste Type", icon: "🗑️", component: "wastetype" },
    { step: 3, label: "Select Skip", icon: "📦", component: "skip" },
    { step: 4, label: "Permit Check", icon: "📋", component: "permit" },
    { step: 5, label: "Choose Date", icon: "📅", component: "date" },
    { step: 6, label: "Payment", icon: "💳", component: "payment" },
  ];

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= steps.length) {
      setCurrentStep(stepNumber);
    }
  };

  // Step-specific handlers
  const handleAddressSelected = (address) => {
    setBookingData((prev) => ({
      ...prev,
      address: address,
    }));
    goToNextStep();
  };

  const handleWasteTypeSelected = (wasteTypes) => {
    setBookingData((prev) => ({
      ...prev,
      wasteTypes: wasteTypes,
    }));
    goToNextStep();
  };

  const handleSkipSelected = (skip) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSkip: skip,
    }));
    goToNextStep();
  };

  const handlePermitCheckComplete = (permitRequired, permitDetails = null) => {
    setBookingData((prev) => ({
      ...prev,
      permitRequired: permitRequired,
      permitDetails: permitDetails,
    }));
    goToNextStep();
  };

  const handleDateSelected = (date, timeSlot) => {
    setBookingData((prev) => ({
      ...prev,
      selectedDate: date,
      timeSlot: timeSlot,
    }));
    goToNextStep();
  };

  const handlePaymentComplete = (paymentDetails) => {
    setBookingData((prev) => ({
      ...prev,
      paymentDetails: paymentDetails,
    }));
    // Handle final booking completion
    console.log("Booking completed:", { ...bookingData, paymentDetails });
  };

  // Reset booking (if needed)
  const resetBooking = () => {
    setCurrentStep(1);
    setBookingData({
      address: null,
      wasteTypes: [],
      selectedSkip: null,
      permitRequired: false,
      permitDetails: null,
      selectedDate: null,
      timeSlot: null,
      paymentDetails: null,
    });
  };

  // Progress component
  const ProgressIndicator = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center min-w-0">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    // Only allow going back to completed steps
                    if (step.step < currentStep) {
                      goToStep(step.step);
                    }
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${
                    step.step < currentStep
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : step.step === currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600 cursor-not-allowed"
                  }`}
                  disabled={step.step > currentStep}
                >
                  {step.step < currentStep ? "✓" : step.step}
                </button>
                <div className="ml-2 min-w-0">
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      step.step === currentStep
                        ? "text-blue-600"
                        : step.step < currentStep
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`ml-4 w-8 h-0.5 flex-shrink-0 ${
                    step.step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PostcodeEntry onAddressSelected={handleAddressSelected} />;

      case 2:
        return (
          <WasteTypeSelection
            onWasteTypeSelected={handleWasteTypeSelected}
            selectedAddress={bookingData.address}
            onBack={goToPreviousStep}
          />
        );

      case 3:
        return (
          <SkipSelection
            onSkipSelected={handleSkipSelected}
            selectedAddress={bookingData.address}
            wasteTypes={bookingData.wasteTypes}
            onBack={goToPreviousStep}
          />
        );

      case 4:
        return (
          <PermitCheck
            onPermitCheckComplete={handlePermitCheckComplete}
            selectedAddress={bookingData.address}
            selectedSkip={bookingData.selectedSkip}
            onBack={goToPreviousStep}
          />
        );

      case 5:
        return (
          <DateSelection
            onDateSelected={handleDateSelected}
            selectedAddress={bookingData.address}
            selectedSkip={bookingData.selectedSkip}
            permitRequired={bookingData.permitRequired}
            onBack={goToPreviousStep}
          />
        );

      case 6:
        return (
          <Payment
            onPaymentComplete={handlePaymentComplete}
            bookingData={bookingData}
            onBack={goToPreviousStep}
          />
        );

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Invalid Step
              </h2>
              <button
                onClick={resetBooking}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress indicator - shown on all steps except step 1 */}
      {currentStep > 1 && <ProgressIndicator />}

      {/* Main content */}
      <main className="min-h-screen">{renderCurrentStep()}</main>

      {/* Debug panel (remove in production) */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-xs">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Current Step: {currentStep}</div>
          <div>Address: {bookingData.address?.postcode || "None"}</div>
          <div>Waste Types: {bookingData.wasteTypes.length}</div>
          <div>Skip: {bookingData.selectedSkip?.size || "None"} yd³</div>
          <div>
            Permit: {bookingData.permitRequired ? "Required" : "Not Required"}
          </div>
          <div>Date: {bookingData.selectedDate || "None"}</div>
          <button
            onClick={resetBooking}
            className="mt-2 bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
          >
            Reset
          </button>
        </div>
      )} */}
    </div>
  );
}

export default App;
