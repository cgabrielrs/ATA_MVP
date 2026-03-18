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

export const exportToPDF = async (data: GenerateMeetingMinutesDraftOutput) => {
  const doc = new jsPDF();

  const margin = 20;
  let y = 45;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ===============================
  // 🔴 LOGO NO TOPO DIREITO
  // ===============================
  const logo = new Image();
  logo.src = '/diniz-logo.png';

  await new Promise((resolve) => {
    logo.onload = resolve;
  });

  const logoWidth = 50;
  const logoHeight = 20;

  doc.addImage(
    logo,
    'PNG',
    pageWidth - logoWidth - margin,
    15,
    logoWidth,
    logoHeight
  );

  // ===============================
  // 🔴 TÍTULO (ALINHADO À ESQUERDA)
  // ===============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(200, 16, 46); // Vermelho institucional

  doc.text('ATA DE REUNIÃO', margin, 30);

  // Linha divisória
  doc.setDrawColor(200, 16, 46);
  doc.setLineWidth(0.8);
  doc.line(margin, 35, pageWidth - margin, 35);

  y += 10;

  // ===============================
  // 📝 OBJETIVOS
  // ===============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Objetivos', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const objectives = doc.splitTextToSize(
    data.objectives || 'Não especificado',
    pageWidth - margin * 2
  );

  doc.text(objectives, margin, y);
  y += objectives.length * 6 + 10;

  // ===============================
  // 👥 PARTICIPANTES
  // ===============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Participantes', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const participants =
    data.participants?.join(', ') || 'Nenhum identificado';

  const splitParticipants = doc.splitTextToSize(
    participants,
    pageWidth - margin * 2
  );

  doc.text(splitParticipants, margin, y);
  y += splitParticipants.length * 6 + 10;

  // ===============================
  // 📌 RESUMo DA DISCUSSÃO
  // ===============================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Resumo da Discussão', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  data.discussionPoints?.forEach((point) => {
    const splitPoint = doc.splitTextToSize(
      `• ${point}`,
      pageWidth - margin * 2
    );

    if (y + splitPoint.length * 6 > pageHeight - 30) {
      doc.addPage();
      y = 30;
    }

    doc.text(splitPoint, margin, y);
    y += splitPoint.length * 6 + 4;
  });

  y += 8;

  // ===============================
  // 🚀 PRÓXIMOS PASSOS
  // ===============================
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 30;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Próximos Passos', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  data.nextSteps?.forEach((step) => {
    const stepText = `• ${step.task} (Responsável: ${
      step.responsible || 'N/A'
    }, Prazo: ${step.deadline || 'N/A'})`;

    const splitStep = doc.splitTextToSize(
      stepText,
      pageWidth - margin * 2
    );

    if (y + splitStep.length * 6 > pageHeight - 30) {
      doc.addPage();
      y = 30;
    }

    doc.text(splitStep, margin, y);
    y += splitStep.length * 6 + 4;
  });

  // ===============================
  // 📄 PAGINAÇÃO
  // ===============================
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

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
            transformation: { width: 140, height: 90 },
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