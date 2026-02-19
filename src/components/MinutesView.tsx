"use client";

import type { GenerateMeetingMinutesDraftOutput } from "@/ai/flows/generate-meeting-minutes-draft";
import { 
  Download, 
  Copy,
  FileDown,
  FileText,
  Printer,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF, exportToDOCX } from "@/lib/export-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface MinutesViewProps {
  data: GenerateMeetingMinutesDraftOutput;
}

export function MinutesView({ data }: MinutesViewProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    const text = `
ATA DE REUNIÃO
OBJETIVOS: ${data.objectives || "N/A"}
PARTICIPANTES: ${data.participants?.join(", ") || "N/A"}

DISCUSSÃO:
${data.discussionPoints?.map(p => `- ${p}`).join("\n")}

PRÓXIMOS PASSOS:
${data.nextSteps?.map(s => `- ${s.task} (${s.responsible || "N/A"})`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "Ata na área de transferência." });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Control Bar */}
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Relatório Estruturado</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 text-[11px] font-semibold border-border">
            <Copy className="h-3 w-3 mr-2" />
            Copiar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 text-[11px] font-semibold">
                <Download className="h-3 w-3 mr-2" />
                Exportar
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-medium">
              <DropdownMenuItem onClick={() => exportToPDF(data)} className="gap-2">
                <FileDown className="h-3 w-3" /> PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToDOCX(data)} className="gap-2">
                <FileText className="h-3 w-3" /> Word (DOCX)
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem onClick={() => window.print()} className="gap-2">
                <Printer className="h-3 w-3" /> Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Document View */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden p-8 md:p-16 space-y-12">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ata de Reunião</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Objetivos</h3>
          <p className="text-sm leading-relaxed text-foreground/80">
            {data.objectives || "Não especificado."}
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Participantes</h3>
          <div className="flex flex-wrap gap-2">
            {data.participants?.map((p, i) => (
              <span key={i} className="text-xs font-medium bg-muted px-2 py-1 rounded">
                {p}
              </span>
            )) || <span className="text-xs text-muted-foreground italic">Nenhum identificado.</span>}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resumo da Discussão</h3>
          <ul className="space-y-4">
            {data.discussionPoints?.map((point, i) => (
              <li key={i} className="flex gap-4 group">
                <span className="text-muted-foreground text-sm font-medium tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-sm leading-relaxed text-foreground/80">{point}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Próximos Passos</h3>
          <div className="grid gap-4">
            {data.nextSteps?.map((step, i) => (
              <div key={i} className="border-l-2 border-foreground/10 pl-4 py-1 space-y-2">
                <p className="text-sm font-semibold">{step.task}</p>
                <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {step.responsible && <span>Resp: {step.responsible}</span>}
                  {step.deadline && <span>Até: {step.deadline}</span>}
                </div>
              </div>
            )) || <p className="text-xs text-muted-foreground italic">Sem ações identificadas.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}