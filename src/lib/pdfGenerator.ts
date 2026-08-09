import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Preloads all <img> tags inside the cloned DOM element (including the official logo and signatures)
 * to ensure images are fully loaded before rendering to canvas.
 */
async function preloadImagesInClone(clone: HTMLElement): Promise<void> {
  const images = Array.from(clone.querySelectorAll('img'));
  const promises = images.map((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // continue even if 1 image fails
    });
  });

  await Promise.all(promises);
}

/**
 * Pre-processes a cloned DOM node for PDF generation to ensure 100% WYSIWYG A4 print perfection:
 * 1. Forces exact A4 paper dimensions (794px width) and edge-to-edge print padding.
 * 2. Completely removes web card UI styling (drop shadows, box shadows, rounded corners, outer margins).
 * 3. Replaces interactive input/select elements with clean inline text spans.
 * 4. Hides non-printable interactive toolbar controls (.no-print).
 * 5. Strips all scrollbars to ensure a clean, professional printed executive report.
 */
function prepareElementForPdfExport(element: HTMLElement): { clone: HTMLElement; cleanup: () => void } {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = '794px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.zIndex = '-9999';

  const clone = element.cloneNode(true) as HTMLElement;

  // 1. Remove all Web UI Card styling (drop shadow, box shadow, rounded corners, outer borders)
  clone.style.display = 'block';
  clone.classList.remove('hidden', 'shadow-2xl', 'shadow-xl', 'shadow-lg', 'shadow-md', 'shadow-sm', 'shadow', 'rounded-2xl', 'rounded-xl', 'rounded-lg', 'rounded');
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minWidth = '794px';
  clone.style.margin = '0';
  clone.style.padding = '4px 8px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.boxSizing = 'border-box';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.border = 'none';
  clone.style.outline = 'none';
  clone.style.overflow = 'visible';
  clone.style.overflowX = 'visible';
  clone.style.overflowY = 'visible';

  // 2. Strip boxShadow, borderRadius, and scrollbars from all child elements in the clone
  const allNodes = clone.querySelectorAll('*') as NodeListOf<HTMLElement>;
  allNodes.forEach((node) => {
    node.style.boxShadow = 'none';
    node.style.borderRadius = '0';
    node.style.overflow = 'visible';
    node.style.overflowX = 'visible';
    node.style.overflowY = 'visible';
    node.style.maxHeight = 'none';
  });

  // Hide non-printable interactive elements
  const noPrintElements = clone.querySelectorAll('.no-print');
  noPrintElements.forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });

  // Force all printable paper table containers and hidden paper sections to be visible
  const paperTables = clone.querySelectorAll('.paper-tables-container');
  paperTables.forEach((pt) => {
    const htmlPt = pt as HTMLElement;
    htmlPt.classList.remove('hidden');
    htmlPt.style.display = 'block';
  });

  // Make header & margins ultra-compact for full A4 printable area
  const header = clone.querySelector('.paper-header') as HTMLElement;
  if (header) {
    header.style.paddingBottom = '2px';
    header.style.marginBottom = '4px';
    header.style.boxShadow = 'none';
    header.style.borderRadius = '0';
  }

  const logo = clone.querySelector('.paper-header img') as HTMLElement;
  if (logo) {
    logo.style.maxHeight = '60px';
    logo.style.height = '60px';
    logo.style.width = 'auto';
    logo.style.objectFit = 'contain';
  }

  // Make fuel sections and wrappers ultra-compact without card margins or shadows
  const tableWrappers = clone.querySelectorAll('.paper-table-wrapper') as NodeListOf<HTMLElement>;
  tableWrappers.forEach((tw) => {
    tw.style.overflow = 'visible';
    tw.style.overflowX = 'visible';
    tw.style.overflowY = 'visible';
    tw.style.width = '100%';
    tw.style.margin = '0 0 4px 0';
    tw.style.boxShadow = 'none';
    tw.style.borderRadius = '0';
  });

  const fuelSections = clone.querySelectorAll('.paper-fuel-section');
  fuelSections.forEach((sec) => {
    const htmlSec = sec as HTMLElement;
    htmlSec.style.marginBottom = '4px';
    htmlSec.style.overflow = 'visible';
    htmlSec.style.overflowX = 'visible';
    htmlSec.style.overflowY = 'visible';
    htmlSec.style.boxShadow = 'none';
    htmlSec.style.borderRadius = '0';
  });

  const tables = clone.querySelectorAll('.paper-table') as NodeListOf<HTMLElement>;
  tables.forEach((tbl) => {
    tbl.style.width = '100%';
    tbl.style.maxWidth = '100%';
    tbl.style.minWidth = '0';
    tbl.style.overflow = 'visible';
    tbl.style.boxShadow = 'none';
    tbl.style.borderRadius = '0';
  });

  // Make table padding ultra-compact so all 3 tables fit on 1 single A4 page
  const tableCells = clone.querySelectorAll('.paper-table th, .paper-table td');
  tableCells.forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    htmlCell.style.padding = '1px 2px';
    htmlCell.style.fontSize = '8.5px';
    htmlCell.style.lineHeight = '1.05';
    htmlCell.style.overflow = 'visible';
    htmlCell.style.boxShadow = 'none';
    htmlCell.style.borderRadius = '0';
  });

  // Make signature block ultra-compact without card shadows
  const sigBlock = clone.querySelector('.paper-signatory-section') as HTMLElement;
  if (sigBlock) {
    sigBlock.style.marginTop = '4px';
    sigBlock.style.paddingTop = '2px';
    sigBlock.style.overflow = 'visible';
    sigBlock.style.boxShadow = 'none';
    sigBlock.style.borderRadius = '0';
  }

  const sigCards = clone.querySelectorAll('.paper-signatory-section > div > div');
  sigCards.forEach((card) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.minHeight = '48px';
    htmlCard.style.padding = '2px';
    htmlCard.style.overflow = 'visible';
    htmlCard.style.boxShadow = 'none';
    htmlCard.style.borderRadius = '0';
  });

  const sigImgs = clone.querySelectorAll('.paper-signatory-section img');
  sigImgs.forEach((imgNode) => {
    const htmlImg = imgNode as HTMLElement;
    htmlImg.style.maxHeight = '24px';
  });

  // Replace form inputs/selects with clean bold text spans for 100% table alignment & precise text positioning
  const inputs = clone.querySelectorAll('input, select, textarea');
  inputs.forEach((inputNode) => {
    const el = inputNode as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    let textVal = el.value || '';

    if (el.tagName.toLowerCase() === 'select') {
      const selectEl = el as HTMLSelectElement;
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      if (selectedOption) {
        textVal = selectedOption.text || textVal;
      }
    }

    // Determine correct text alignment: check classes and parent container
    const isInsideCell = Boolean(el.closest('td, th'));
    const isTextRight = el.classList.contains('text-right') || el.style.textAlign === 'right';
    const isTextLeft =
      el.classList.contains('text-left') ||
      el.type === 'date' ||
      el.tagName.toLowerCase() === 'textarea' ||
      el.style.textAlign === 'left';

    let align = 'center';
    if (isInsideCell) {
      align = isTextRight ? 'right' : isTextLeft ? 'left' : 'center';
    } else {
      align = isTextRight ? 'right' : 'left';
    }

    // Format monetary numbers outside tables with clean SAR suffix if numeric
    let displayVal = textVal;
    if (
      !isInsideCell &&
      el.type === 'number' &&
      displayVal !== '' &&
      !isNaN(Number(displayVal)) &&
      !displayVal.includes('SAR')
    ) {
      const numVal = parseFloat(displayVal);
      displayVal = `${numVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = displayVal;
    textSpan.style.fontFamily = 'inherit';
    textSpan.style.fontSize = '8.5px';
    textSpan.style.fontWeight = 'bold';
    textSpan.style.color = '#000000';
    textSpan.style.textAlign = align;
    textSpan.style.display = 'inline-block';
    textSpan.style.width = '100%';
    textSpan.style.lineHeight = '1.05';

    if (el.parentNode) {
      el.parentNode.replaceChild(textSpan, el);
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    clone,
    cleanup: () => {
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    },
  };
}

/**
 * Exports the station audit paper form to a high-resolution single-page A4 PDF document
 * with 100% WYSIWYG layout, official logo, and clean edge-to-edge printable format (no web card UI styling).
 */
export async function exportAuditToPdf(
  auditNumber: string,
  stationName: string,
  elementId: string = 'paper-form-document'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`PDF export failed: Element #${elementId} not found in DOM.`);
    alert('Could not find the audit form element to export.');
    return;
  }

  let prepared: { clone: HTMLElement; cleanup: () => void } | null = null;

  try {
    // 1. Prepare clone with exact single-page A4 styling, logo & text replacement (no card shadows or margins)
    prepared = prepareElementForPdfExport(element);

    // 2. Preload all images (logo & handwritten signatures) in clone
    await preloadImagesInClone(prepared.clone);

    // 3. Render to high-res canvas using html2canvas (forces 794px windowWidth for 100% Android & Desktop parity)
    const canvas = await html2canvas(prepared.clone, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 794,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 4. Setup A4 PDF document (210mm x 297mm) with 5mm equal standard printable margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = 5; // 5mm standard printable margin

    const printableWidth = pdfWidth - margin * 2; // 200mm
    const printableHeight = pdfHeight - margin * 2; // 287mm

    const naturalImgWidth = printableWidth;
    let naturalImgHeight = (canvas.height * naturalImgWidth) / canvas.width;

    const xPos = margin + (printableWidth - naturalImgWidth) / 2;

    if (naturalImgHeight <= printableHeight * 1.15) {
      // --- PERFECT SINGLE PAGE A4 OUTPUT ---
      // Scale height proportionally to fit 100% cleanly on 1 single A4 page
      const finalImgHeight = Math.min(printableHeight, naturalImgHeight);
      pdf.addImage(imgData, 'JPEG', xPos, margin, naturalImgWidth, finalImgHeight);
    } else {
      // --- FALLBACK MULTI-PAGE OUTPUT (If audit content is exceptionally large) ---
      let pageIndex = 0;
      while (true) {
        const yOffset = margin - pageIndex * printableHeight;
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', xPos, yOffset, naturalImgWidth, naturalImgHeight);
        pageIndex++;
        if (pageIndex * printableHeight >= naturalImgHeight) break;
      }
    }

    // 5. Save PDF file
    const sanitizedStation = stationName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Station_Audit_${auditNumber}_${sanitizedStation}.pdf`;
    pdf.save(fileName);
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    alert(`An error occurred while generating the PDF: ${error?.message || 'Export error'}`);
  } finally {
    if (prepared) {
      prepared.cleanup();
    }
  }
}
