export interface StepperProps {
  handleNext: () => void;
  handleBack: () => void;
  currentStep?: number;
}
