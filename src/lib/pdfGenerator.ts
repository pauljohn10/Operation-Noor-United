import { toCanvas } from 'html-to-image';
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
 * 1. Forces exact A4 paper dimensions (794px width) and optimized compact PDF print padding.
 * 2. Replaces interactive input/select elements with clean inline text spans.
 * 3. Hides non-printable interactive toolbar controls (.no-print).
 * 4. Completely strips all horizontal & vertical scrollbars to guarantee clean PDF rendering.
 * 5. Ensures all 3 fuel sections (Petrol 91, Petrol 95, Diesel) and signature cards fit cleanly on A4.
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

  // Enforce exact A4 document dimensions and ultra-compact print padding
  clone.style.display = 'block';
  clone.classList.remove('hidden');
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minWidth = '794px';
  clone.style.margin = '0';
  clone.style.padding = '8px 16px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.boxSizing = 'border-box';
  clone.style.boxShadow = 'none';
  clone.style.overflow = 'visible';
  clone.style.overflowX = 'visible';
  clone.style.overflowY = 'visible';

  // Completely strip all scrollbars from all child elements in the clone
  const allNodes = clone.querySelectorAll('*') as NodeListOf<HTMLElement>;
  allNodes.forEach((node) => {
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

  // Make header & margins ultra-compact for PDF rendering
  const header = clone.querySelector('.paper-header') as HTMLElement;
  if (header) {
    header.style.paddingBottom = '2px';
    header.style.marginBottom = '4px';
  }

  const logo = clone.querySelector('.paper-header img') as HTMLElement;
  if (logo) {
    logo.style.maxHeight = '38px';
  }

  // Make fuel sections and wrappers ultra-compact without scrollbars
  const tableWrappers = clone.querySelectorAll('.paper-table-wrapper') as NodeListOf<HTMLElement>;
  tableWrappers.forEach((tw) => {
    tw.style.overflow = 'visible';
    tw.style.overflowX = 'visible';
    tw.style.overflowY = 'visible';
    tw.style.width = '100%';
    tw.style.margin = '0 0 4px 0';
  });

  const fuelSections = clone.querySelectorAll('.paper-fuel-section');
  fuelSections.forEach((sec) => {
    const htmlSec = sec as HTMLElement;
    htmlSec.style.marginBottom = '4px';
    htmlSec.style.overflow = 'visible';
    htmlSec.style.overflowX = 'visible';
    htmlSec.style.overflowY = 'visible';
  });

  const tables = clone.querySelectorAll('.paper-table') as NodeListOf<HTMLElement>;
  tables.forEach((tbl) => {
    tbl.style.width = '100%';
    tbl.style.maxWidth = '100%';
    tbl.style.minWidth = '0';
    tbl.style.overflow = 'visible';
  });

  // Make table padding ultra-compact so all 3 tables fit on 1 single A4 page
  const tableCells = clone.querySelectorAll('.paper-table th, .paper-table td');
  tableCells.forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    htmlCell.style.padding = '1px 2px';
    htmlCell.style.fontSize = '8.5px';
    htmlCell.style.lineHeight = '1.05';
    htmlCell.style.overflow = 'visible';
  });

  // Make signature block ultra-compact
  const sigBlock = clone.querySelector('.paper-signatory-section') as HTMLElement;
  if (sigBlock) {
    sigBlock.style.marginTop = '4px';
    sigBlock.style.paddingTop = '2px';
    sigBlock.style.overflow = 'visible';
  }

  const sigCards = clone.querySelectorAll('.paper-signatory-section > div > div');
  sigCards.forEach((card) => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.minHeight = '48px';
    htmlCard.style.padding = '2px';
    htmlCard.style.overflow = 'visible';
  });

  const sigImgs = clone.querySelectorAll('.paper-signatory-section img');
  sigImgs.forEach((imgNode) => {
    const htmlImg = imgNode as HTMLElement;
    htmlImg.style.maxHeight = '24px';
  });

  // Replace form inputs/selects with clean bold text spans for 100% table alignment
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

    const textSpan = document.createElement('span');
    textSpan.textContent = textVal;
    textSpan.style.fontFamily = 'inherit';
    textSpan.style.fontSize = '8.5px';
    textSpan.style.fontWeight = 'bold';
    textSpan.style.color = '#000000';
    textSpan.style.textAlign = 'center';
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
 * with 100% WYSIWYG layout, official logo, and compact signature block.
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
    // 1. Prepare clone with exact single-page A4 styling, logo & text replacement
    prepared = prepareElementForPdfExport(element);

    // 2. Preload all images (logo & handwritten signatures) in clone
    await preloadImagesInClone(prepared.clone);

    // 3. Render to high-res canvas (2x pixel ratio for crisp typography and lines)
    const canvas = await toCanvas(prepared.clone, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      width: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // 4. Setup A4 PDF document (210mm x 297mm) with 8mm equal page margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const margin = 8; // 8mm margins on all sides

    const printableWidth = pdfWidth - margin * 2; // 194mm
    const printableHeight = pdfHeight - margin * 2; // 281mm

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
