interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-blue h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span className={currentStep >= 1 ? "text-brand-blue font-medium" : ""}>Upload Quotes</span>
        <span className={currentStep >= 2 ? "text-brand-blue font-medium" : ""}>AI Analysis</span>
        <span className={currentStep >= 3 ? "text-brand-blue font-medium" : ""}>Generate PO</span>
      </div>
    </div>
  )
}
