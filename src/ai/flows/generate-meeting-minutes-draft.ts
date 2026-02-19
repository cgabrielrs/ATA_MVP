'use server';
/**
 * @fileOverview Um fluxo Genkit para gerar um rascunho estruturado de atas de reunião a partir de uma transcrição.
 *
 * - generateMeetingMinutesDraft - Uma função que lida com o processo de geração da ata.
 * - GenerateMeetingMinutesDraftInput - O tipo de entrada para a função.
 * - GenerateMeetingMinutesDraftOutput - O tipo de retorno da função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMeetingMinutesDraftInputSchema = z.object({
  transcript: z.string().describe('O texto completo da transcrição da reunião.').min(1, 'A transcrição não pode estar vazia.'),
});
export type GenerateMeetingMinutesDraftInput = z.infer<typeof GenerateMeetingMinutesDraftInputSchema>;

const GenerateMeetingMinutesDraftOutputSchema = z.object({
  participants: z.array(z.string()).describe('Uma lista de nomes das pessoas que participaram da reunião.').optional(),
  objectives: z.string().describe('O objetivo principal ou meta discutida na reunião.').optional(),
  discussionPoints: z.array(z.string()).describe('Um resumo dos principais tópicos e discussões ocorridos, apresentados como uma lista de pontos.').optional(),
  nextSteps: z.array(z.object({
    task: z.string().describe('A ação a ser realizada.'),
    deadline: z.string().optional().describe('O prazo para a tarefa, se especificado (ex: "próxima sexta", "26 de outubro").'),
    responsible: z.string().optional().describe('A pessoa responsável pela tarefa, se identificada.'),
  })).describe('Uma lista de ações futuras, tarefas, prazos e partes responsáveis identificadas durante a reunião.').optional(),
});
export type GenerateMeetingMinutesDraftOutput = z.infer<typeof GenerateMeetingMinutesDraftOutputSchema>;

export async function generateMeetingMinutesDraft(input: GenerateMeetingMinutesDraftInput): Promise<GenerateMeetingMinutesDraftOutput> {
  return generateMeetingMinutesDraftFlow(input);
}

const generateMeetingMinutesPrompt = ai.definePrompt({
  name: 'generateMeetingMinutesPrompt',
  input: { schema: GenerateMeetingMinutesDraftInputSchema },
  output: { schema: GenerateMeetingMinutesDraftOutputSchema },
  prompt: `Você é um assistente especializado na geração de atas de reunião profissionais. Seu papel é analisar cuidadosamente a transcrição da reunião fornecida e extrair as seguintes informações principais, estruturando-as em um rascunho claro, conciso e profissional em Português do Brasil.

Seu retorno deve ser um objeto JSON que siga estritamente o esquema fornecido. Se uma informação não for mencionada explicitamente ou não puder ser claramente inferida da transcrição, o campo correspondente deve ser omitido ou deixado vazio.

Aqui está o que você precisa extrair:
1.  **Participantes**: Identifique os nomes de todos os indivíduos que falaram ou foram referidos como presentes.
2.  **Objetivos da Reunião**: Determine e resuma o propósito principal ou as metas discutidas.
3.  **Pontos de Discussão**: Resuma os tópicos, decisões e assuntos mais importantes. Cada ponto deve ser um resumo conciso.
4.  **Próximos Passos**: Identifique quaisquer ações acordadas, tarefas, prazos (se especificados) e quem é o responsável (se identificado).

Transcrição da Reunião:
{{{transcript}}}
`,
});

const generateMeetingMinutesDraftFlow = ai.defineFlow(
  {
    name: 'generateMeetingMinutesDraftFlow',
    inputSchema: GenerateMeetingMinutesDraftInputSchema,
    outputSchema: GenerateMeetingMinutesDraftOutputSchema,
  },
  async (input) => {
    const { output } = await generateMeetingMinutesPrompt(input);
    return output!;
  }
);
