import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  BorderStyle,
  LevelFormat,
  TabStopType,
  TabStopPosition,
} from 'docx';
import { saveAs } from 'file-saver';
import type { GenerateMeetingMinutesDraftOutput } from '@/ai/flows/generate-meeting-minutes-draft';

/* =========================================================
   PDF EXPORT
========================================================= */

export const exportToPDF = async (
  data: GenerateMeetingMinutesDraftOutput
) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 30;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // LOGO
  const logo = new Image();
  logo.src = '/diniz-logo.png';

  await new Promise((resolve) => {
    logo.onload = resolve;
  });

  doc.addImage(logo, 'PNG', pageWidth - 60, 15, 40, 18);

  // TÍTULO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Ata de Reunião', margin, y);

  y += 10;

  // DATA
  const hoje = new Date().toLocaleDateString('pt-BR');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Gerado em ${hoje}`, margin, y);

  y += 15;

  // OBJETIVOS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Objetivos', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const objectives = doc.splitTextToSize(
    data.objectives || 'Não especificado',
    pageWidth - margin * 2
  );

  doc.text(objectives, margin, y);
  y += objectives.length * 6 + 12;

  // PARTICIPANTES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Participantes', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');

  const participants =
    data.participants?.join(', ') || 'Nenhum identificado';

  const splitParticipants = doc.splitTextToSize(
    participants,
    pageWidth - margin * 2
  );

  doc.text(splitParticipants, margin, y);
  y += splitParticipants.length * 6 + 12;

  // RESUMO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumo da Discussão', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');

  data.discussionPoints?.forEach((point) => {
    const bulleted = `• ${point}`;

    const splitPoint = doc.splitTextToSize(
      bulleted,
      pageWidth - margin * 2
    );

    if (y + splitPoint.length * 6 > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(splitPoint, margin, y);
    y += splitPoint.length * 6 + 8;
  });

  y += 10;

  // PRÓXIMOS PASSOS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Próximos Passos', margin, y);

  y += 8;

  data.nextSteps?.forEach((step) => {
    const taskText = doc.splitTextToSize(
      `• ${step.task}`,
      pageWidth - margin * 2
    );

    if (y + taskText.length * 6 > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.text(taskText, margin, y);
    y += taskText.length * 6 + 5;

    doc.setFont('helvetica', 'normal');
    const meta = `Responsável: ${step.responsible || 'Não informado'}${step.deadline ? `  |  Prazo: ${step.deadline}` : ''}`;
    doc.text(meta, margin, y);
    doc.setFont('helvetica', 'normal');

    y += 10;
  });

  doc.save('Ata_Reuniao_Diniz.pdf');
};

/* =========================================================
   DOCX EXPORT — estilo idêntico ao PDF
   Layout:
   - Cabeçalho: "ATA DE REUNIÃO" vermelho (esquerda) + logo (direita)
   - Linha vermelha separadora
   - Seções com título bold preto + corpo normal
   - Bullet points (•) em Discussão e Próximos Passos
   - Rodapé: "Página X de Y" centralizado
========================================================= */
export const exportToDOCX = async (
  data: GenerateMeetingMinutesDraftOutput
) => {
  const hoje = new Date().toLocaleDateString('pt-BR');

  // Carrega logo
  const response = await fetch('/diniz-logo.png');
  const logoBuffer = await response.arrayBuffer();

  // ── Cor vermelha Diniz ──────────────────────────────────
  const RED = 'C0272D';

  // ── Linha separadora vermelha (borda inferior num parágrafo vazio) ──
  const redDivider = new Paragraph({
    spacing: { before: 0, after: 200 },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 12,       // ~1.5pt
        color: RED,
        space: 1,
      },
    },
    children: [],
  });

  // ── Helper: título de seção ──────────────────────────────
  const sectionTitle = (text: string) =>
    new Paragraph({
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text,
          bold: true,
          size: 24,           // 12pt
          font: 'Arial',
        }),
      ],
    });

  // ── Helper: parágrafo de corpo normal ───────────────────
  const bodyParagraph = (text: string) =>
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({
          text,
          size: 22,           // 11pt
          font: 'Arial',
        }),
      ],
    });

  // ── Configuração de bullet (usa numbering, não unicode) ──
  const numbering = {
    config: [
      {
        reference: 'diniz-bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 360, hanging: 360 },
              },
            },
          },
        ],
      },
    ],
  };

  const bulletParagraph = (text: string, extraChildren: ReturnType<typeof TextRun>[] = []) =>
    new Paragraph({
      numbering: { reference: 'diniz-bullets', level: 0 },
      spacing: { after: 100 },
      children: [
        new TextRun({ text, size: 22, font: 'Arial' }),
        ...extraChildren,
      ],
    });

  // ── Cabeçalho: título vermelho + logo à direita ──────────
  const docHeader = new Header({
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [
          // Título vermelho à esquerda
          new TextRun({
            text: 'ATA DE REUNIÃO',
            bold: true,
            size: 40,         // 20pt
            color: RED,
            font: 'Arial',
          }),
          // Tab para empurrar logo à direita
          new TextRun({
            text: '\t',
          }),
          // Logo
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 110, height: 122 },
            type: 'png',
          }),
        ],
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
      }),
      // Linha vermelha abaixo do cabeçalho
      new Paragraph({
        spacing: { before: 60, after: 0 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: RED,
            space: 1,
          },
        },
        children: [],
      }),
    ],
  });

  // ── Rodapé: "Página X de Y" centralizado ─────────────────
  const docFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: 'Página ',
            size: 18,
            color: '888888',
            font: 'Arial',
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 18,
            color: '888888',
            font: 'Arial',
          }),
          new TextRun({
            text: ' de ',
            size: 18,
            color: '888888',
            font: 'Arial',
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 18,
            color: '888888',
            font: 'Arial',
          }),
        ],
      }),
    ],
  });

  // ── Conteúdo principal ───────────────────────────────────
  const children = [
    // Data
    new Paragraph({
      spacing: { before: 100, after: 300 },
      children: [
        new TextRun({
          text: `Gerado em ${hoje}`,
          size: 20,
          color: '666666',
          font: 'Arial',
        }),
      ],
    }),

    // OBJETIVOS
    sectionTitle('Objetivos'),
    bodyParagraph(data.objectives || 'Não especificado.'),

    // Espaço
    new Paragraph({ spacing: { after: 100 }, children: [] }),

    // PARTICIPANTES
    sectionTitle('Participantes'),
    bodyParagraph(data.participants?.join(', ') || 'Nenhum identificado.'),

    // Espaço
    new Paragraph({ spacing: { after: 100 }, children: [] }),

    // RESUMO DA DISCUSSÃO
    sectionTitle('Resumo da Discussão'),

    ...(data.discussionPoints?.map((point) =>
      bulletParagraph(point)
    ) || [new Paragraph({ children: [new TextRun({ text: 'Nenhum ponto registrado.', size: 22, font: 'Arial' })] })]),

    // Espaço
    new Paragraph({ spacing: { after: 100 }, children: [] }),

    // PRÓXIMOS PASSOS
    sectionTitle('Próximos Passos'),

    ...(data.nextSteps?.flatMap((step) => [
      // keepNext: true mantém este parágrafo junto com o próximo (responsável)
      new Paragraph({
        numbering: { reference: 'diniz-bullets', level: 0 },
        spacing: { after: 80 },
        keepNext: true,   // não separa tarefa do responsável
        keepLines: true,  // não quebra no meio da linha
        children: [
          new TextRun({ text: step.task, size: 22, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        indent: { left: 360 },
        keepLines: true,
        children: [
          new TextRun({
            text: `Responsável: ${step.responsible || 'Não informado'}`,
            size: 20,
            font: 'Arial',
            color: '444444',
          }),
          ...(step.deadline
            ? [
                new TextRun({
                  text: `  |  Prazo: ${step.deadline}`,
                  size: 20,
                  font: 'Arial',
                  color: '444444',
                }),
              ]
            : []),
        ],
      }),
    ]) || []),
  ];

  // ── Monta documento ───────────────────────────────────────
  const doc = new Document({
    numbering,
    sections: [
      {
        headers: { default: docHeader },
        footers: { default: docFooter },
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: {
              top: 2600,
              right: 1200,
              bottom: 1200,
              left: 1200,
            },
          },
          pageNumberStart: 1,
          pageNumberFormatType: NumberFormat.DECIMAL,
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'Ata_Reuniao_Diniz.docx');
};