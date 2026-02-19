import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import type { GenerateMeetingMinutesDraftOutput } from '@/ai/flows/generate-meeting-minutes-draft';

export const exportToPDF = (data: GenerateMeetingMinutesDraftOutput) => {
  const doc = new jsPDF();
  const title = 'ATA DE REUNIÃO';
  const margin = 20;
  let y = 30;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(63, 81, 181); // Primary Blue
  doc.text(title, margin, y);
  y += 15;

  // Objectives
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Objetivos:', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const objectives = doc.splitTextToSize(data.objectives || 'Não especificado', 170);
  doc.text(objectives, margin, y);
  y += (objectives.length * 6) + 10;

  // Participants
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Participantes:', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const participants = data.participants?.join(', ') || 'Nenhum identificado';
  doc.text(participants, margin, y);
  y += 15;

  // Discussion Points
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumo da Discussão:', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  data.discussionPoints?.forEach((point) => {
    const splitPoint = doc.splitTextToSize(`• ${point}`, 170);
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(splitPoint, margin, y);
    y += (splitPoint.length * 6) + 2;
  });
  y += 10;

  // Next Steps
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Próximos Passos:', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  data.nextSteps?.forEach((step) => {
    const stepText = `• ${step.task} (Responsável: ${step.responsible || 'N/A'}, Prazo: ${step.deadline || 'N/A'})`;
    const splitStep = doc.splitTextToSize(stepText, 170);
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(splitStep, margin, y);
    y += (splitStep.length * 6) + 2;
  });

  doc.save('Ata_Reuniao_AtaZap.pdf');
};

export const exportToDOCX = async (data: GenerateMeetingMinutesDraftOutput) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'ATA DE REUNIÃO',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),
          
          new Paragraph({
            text: 'OBJETIVOS',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [new TextRun(data.objectives || 'Não especificado')],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'PARTICIPANTES',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [new TextRun(data.participants?.join(', ') || 'Nenhum identificado')],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'RESUMO DA DISCUSSÃO',
            heading: HeadingLevel.HEADING_2,
          }),
          ...(data.discussionPoints?.map(point => 
            new Paragraph({
              text: point,
              bullet: { level: 0 }
            })
          ) || [new Paragraph({ text: 'Nenhum ponto extraído' })]),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({
            text: 'PRÓXIMOS PASSOS',
            heading: HeadingLevel.HEADING_2,
          }),
          ...(data.nextSteps?.map(step => 
            new Paragraph({
              children: [
                new TextRun({ text: step.task, bold: true }),
                new TextRun(` (Responsável: ${step.responsible || 'N/A'}, Prazo: ${step.deadline || 'N/A'})`),
              ],
              bullet: { level: 0 }
            })
          ) || [new Paragraph({ text: 'Nenhuma ação identificada' })]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Ata_Reuniao_AtaZap.docx');
};
