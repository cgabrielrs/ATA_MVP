"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

const steps = [
  "Analisando estrutura da transcrição...",
  "Identificando participantes e oradores...",
  "Resumindo os principais pontos de discussão...",
  "Mapeando tarefas e próximos passos...",
  "Finalizando rascunho estruturado..."
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Muda a etapa a cada 2.5 segundos para dar tempo de leitura

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
        </div>
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 transition-all duration-500 ${
              index === currentStep 
                ? "opacity-100 scale-100" 
                : index < currentStep 
                  ? "opacity-40 scale-95" 
                  : "opacity-20 scale-95"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : index === currentStep ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={`text-xs font-medium tracking-tight ${index === currentStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
