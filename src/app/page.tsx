"use client";

import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { MinutesView } from "@/components/MinutesView";
import { EditView } from "@/components/EditView";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  Trash2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { generateMeetingMinutesDraft, type GenerateMeetingMinutesDraftOutput } from "@/ai/flows/generate-meeting-minutes-draft";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

type AppState = "input" | "loading" | "edit" | "result";

export default function AtataDinizApp() {
  const [appState, setAppState] = useState<AppState>("input");
  const [transcript, setTranscript] = useState("");
  const [draftResult, setDraftResult] = useState<GenerateMeetingMinutesDraftOutput | null>(null);
  const [finalResult, setFinalResult] = useState<GenerateMeetingMinutesDraftOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Apenas arquivos .txt são aceitos.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setTranscript(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const processTranscription = async () => {
    if (!transcript.trim()) return;

    setAppState("loading");
    try {
      const output = await generateMeetingMinutesDraft({ transcript });
      setDraftResult(output);
      // Simula um tempo extra para que o usuário veja as etapas de carregamento finais
      setTimeout(() => setAppState("edit"), 1000);
    } catch (error) {
      setAppState("input");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao processar a transcrição.",
      });
    }
  };

  const handleSaveEdit = (data: GenerateMeetingMinutesDraftOutput) => {
    setFinalResult(data);
    setAppState("result");
  };

  const resetApp = () => {
    setAppState("input");
    setTranscript("");
    setDraftResult(null);
    setFinalResult(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <main className="flex-1 workspace-container py-12 md:py-20">
        
        {appState === "input" && (
          <div className="space-y-12 max-w-2xl mx-auto animate-in fade-in duration-500">
            <header className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight">Nova Ata</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Insira a transcrição da sua reunião abaixo. Nossa IA irá estruturar os pontos principais, participantes e tarefas para você editar e exportar.
              </p>
            </header>

            <div className="space-y-6">
              <div className="relative border rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 bg-[#fdfdfd] border-b">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transcrição</span>
                  <div className="flex items-center gap-2">
                    {transcript && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-destructive hover:bg-destructive/5"
                        onClick={() => setTranscript("")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".txt"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      size="sm" 
                      className="rounded-md font-semibold h-10 px-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-2" />
                      Importar .txt
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Cole sua transcrição aqui..."
                  className="min-h-[400px] p-6 text-sm leading-relaxed border-none focus-visible:ring-0 resize-none bg-transparent"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                  <Sparkles className="h-3 w-3" />
                  Privacidade garantida via IA segura
                </div>
                <Button 
                  size="sm" 
                  className="rounded-md font-semibold h-10 px-6"
                  onClick={processTranscription}
                  disabled={!transcript.trim()}
                >
                  Gerar Documento
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {appState === "loading" && <LoadingState />}

        {appState === "edit" && draftResult && (
          <EditView 
            initialData={draftResult} 
            onSave={handleSaveEdit}
            onCancel={() => setAppState("input")}
          />
        )}

        {appState === "result" && finalResult && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground text-[11px] font-bold uppercase tracking-wider"
              onClick={() => setAppState("edit")}
            >
              ← Voltar para edição
            </Button>
            <MinutesView data={finalResult} />
            
            <div className="flex justify-center pt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetApp}
                className="text-[10px] uppercase font-bold tracking-wider"
              >
                Nova Reunião
              </Button>
            </div>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}
