"use client";

import { useState } from "react";
import type { GenerateMeetingMinutesDraftOutput } from "@/ai/flows/generate-meeting-minutes-draft";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Save, 
  UserPlus, 
  ListTodo,
  MessageSquareText,
  Target
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface EditViewProps {
  initialData: GenerateMeetingMinutesDraftOutput;
  onSave: (data: GenerateMeetingMinutesDraftOutput) => void;
  onCancel: () => void;
}

export function EditView({ initialData, onSave, onCancel }: EditViewProps) {
  const [data, setData] = useState<GenerateMeetingMinutesDraftOutput>(initialData);

  const updateField = (field: keyof GenerateMeetingMinutesDraftOutput, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    updateField("participants", [...(data.participants || []), ""]);
  };

  const removeParticipant = (index: number) => {
    updateField("participants", data.participants?.filter((_, i) => i !== index));
  };

  const addDiscussionPoint = () => {
    updateField("discussionPoints", [...(data.discussionPoints || []), ""]);
  };

  const removeDiscussionPoint = (index: number) => {
    updateField("discussionPoints", data.discussionPoints?.filter((_, i) => i !== index));
  };

  const addNextStep = () => {
    updateField("nextSteps", [...(data.nextSteps || []), { task: "", responsible: "", deadline: "" }]);
  };

  const removeNextStep = (index: number) => {
    updateField("nextSteps", data.nextSteps?.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-10 pb-20 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Editar Rascunho</h2>
          <p className="text-sm text-muted-foreground">Revise e ajuste as informações extraídas pela IA.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-[10px] uppercase font-bold tracking-wider">
            Descartar
          </Button>
          <Button size="sm" onClick={() => onSave(data)} className="h-9 px-4 font-semibold text-xs">
            <Save className="h-3.5 w-3.5 mr-2" />
            Finalizar Documento
          </Button>
        </div>
      </header>

      {/* Objectives */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Objetivos</h3>
        </div>
        <Textarea 
          value={data.objectives}
          onChange={(e) => updateField("objectives", e.target.value)}
          className="min-h-[80px] text-sm bg-white"
          placeholder="Qual era o objetivo principal da reunião?"
        />
      </section>

      <Separator />

      {/* Participants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Participantes</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addParticipant} className="h-7 px-2 text-[10px] font-bold">
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.participants?.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Input 
                value={p}
                onChange={(e) => {
                  const newParticipants = [...(data.participants || [])];
                  newParticipants[i] = e.target.value;
                  updateField("participants", newParticipants);
                }}
                className="h-9 text-sm bg-white"
              />
              <Button variant="ghost" size="icon" onClick={() => removeParticipant(i)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Discussion Points */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Discussão</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addDiscussionPoint} className="h-7 px-2 text-[10px] font-bold">
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-3">
          {data.discussionPoints?.map((point, i) => (
            <div key={i} className="flex gap-2">
              <Textarea 
                value={point}
                onChange={(e) => {
                  const newPoints = [...(data.discussionPoints || [])];
                  newPoints[i] = e.target.value;
                  updateField("discussionPoints", newPoints);
                }}
                className="min-h-[60px] text-sm bg-white"
              />
              <Button variant="ghost" size="icon" onClick={() => removeDiscussionPoint(i)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Next Steps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Próximos Passos</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addNextStep} className="h-7 px-2 text-[10px] font-bold">
            <Plus className="h-3 w-3 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-4">
          {data.nextSteps?.map((step, i) => (
            <div key={i} className="p-4 border rounded-lg bg-white space-y-4 relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeNextStep(i)} 
                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tarefa</Label>
                  <Input 
                    value={step.task}
                    onChange={(e) => {
                      const newSteps = [...(data.nextSteps || [])];
                      newSteps[i] = { ...newSteps[i], task: e.target.value };
                      updateField("nextSteps", newSteps);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Responsável</Label>
                    <Input 
                      value={step.responsible}
                      onChange={(e) => {
                        const newSteps = [...(data.nextSteps || [])];
                        newSteps[i] = { ...newSteps[i], responsible: e.target.value };
                        updateField("nextSteps", newSteps);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Prazo</Label>
                    <Input 
                      value={step.deadline}
                      onChange={(e) => {
                        const newSteps = [...(data.nextSteps || [])];
                        newSteps[i] = { ...newSteps[i], deadline: e.target.value };
                        updateField("nextSteps", newSteps);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
