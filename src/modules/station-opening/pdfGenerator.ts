import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { SOPdfLayout } from './components/SOPdfLayout';
import type { StationOpeningForm } from './types';

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
 * 2. Unhides hidden print container elements.
 * 3. Replaces interactive input/select elements with clean inline text spans.
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

  // Enforce exact A4 document dimensions and print styling
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

  // Replace form inputs/selects with clean bold text spans if any exist
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
    textSpan.style.display = 'inline-block';

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
 * Exports the Station Opening Form to a high-resolution A4 PDF document
 * with 100% WYSIWYG layout, official company logo (/logo_transparent.png), and digital signature boxes.
 */
export async function exportStationOpeningToPdf(
  form: StationOpeningForm,
  elementId: string = 'station-opening-pdf-document'
): Promise<void> {
  let mountedRoot: ReturnType<typeof createRoot> | null = null;
  let dynamicContainer: HTMLElement | null = null;
  let targetElement = document.getElementById(elementId);

  // If the PDF layout DOM element is not mounted (e.g. exporting from List View table),
  // dynamically render SOPdfLayout in a temporary DOM node
  if (!targetElement) {
    dynamicContainer = document.createElement('div');
    dynamicContainer.style.position = 'absolute';
    dynamicContainer.style.left = '-9999px';
    dynamicContainer.style.top = '0';
    dynamicContainer.style.width = '794px';
    dynamicContainer.style.backgroundColor = '#ffffff';
    document.body.appendChild(dynamicContainer);

    mountedRoot = createRoot(dynamicContainer);
    mountedRoot.render(React.createElement(SOPdfLayout, { form }));

    // Wait 150ms for React component to mount
    await new Promise((resolve) => setTimeout(resolve, 150));
    targetElement = document.getElementById(elementId) || (dynamicContainer.firstElementChild as HTMLElement);
  }

  if (!targetElement) {
    console.error(`PDF export failed: Element #${elementId} not found.`);
    alert('Could not find the Station Opening Form document to export.');
    if (dynamicContainer && dynamicContainer.parentNode) {
      dynamicContainer.parentNode.removeChild(dynamicContainer);
    }
    return;
  }

  let prepared: { clone: HTMLElement; cleanup: () => void } | null = null;

  try {
    // 1. Prepare off-screen clone with exact A4 dimensions & formatting
    prepared = prepareElementForPdfExport(targetElement);

    // 2. Preload all images (official company logo & handwritten signatures)
    await preloadImagesInClone(prepared.clone);

    // 3. Setup A4 PDF document (210mm x 297mm) with 8mm equal page margins
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

    const pageNodes = Array.from(prepared.clone.querySelectorAll('.pdf-page')) as HTMLElement[];

    if (pageNodes.length > 0) {
      // --- MULTI-PAGE SECTION-BASED RENDER (EXACT A4 PERFECTION) ---
      for (let i = 0; i < pageNodes.length; i++) {
        const pageEl = pageNodes[i];
        await preloadImagesInClone(pageEl);

        const canvas = await toCanvas(pageEl, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
          width: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgHeightMm = (canvas.height * printableWidth) / canvas.width;
        const finalImgHeight = Math.min(printableHeight, imgHeightMm);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', margin, margin, printableWidth, finalImgHeight);
      }
    } else {
      // --- SINGLE CANVAS FALLBACK ---
      const canvas = await toCanvas(prepared.clone, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: 794,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const naturalImgWidth = printableWidth;
      let naturalImgHeight = (canvas.height * naturalImgWidth) / canvas.width;
      const xPos = margin + (printableWidth - naturalImgWidth) / 2;

      if (naturalImgHeight <= printableHeight * 1.15) {
        const finalImgHeight = Math.min(printableHeight, naturalImgHeight);
        pdf.addImage(imgData, 'JPEG', xPos, margin, naturalImgWidth, finalImgHeight);
      } else {
        let pageIndex = 0;
        while (true) {
          const yOffset = margin - pageIndex * printableHeight;
          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', xPos, yOffset, naturalImgWidth, naturalImgHeight);
          pageIndex++;
          if (pageIndex * printableHeight >= naturalImgHeight) break;
        }
      }
    }

    // 5. Save PDF file
    const sanitizedStation = (form.station_name || 'Station').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Station_Opening_Form_${form.form_number}_${sanitizedStation}.pdf`;
    pdf.save(fileName);
  } catch (error: any) {
    console.error('Station Opening PDF Generation Error:', error);
    alert(`An error occurred while generating the PDF: ${error?.message || 'Export error'}`);
  } finally {
    if (prepared) {
      prepared.cleanup();
    }
    if (mountedRoot && dynamicContainer) {
      mountedRoot.unmount();
      if (dynamicContainer.parentNode) {
        dynamicContainer.parentNode.removeChild(dynamicContainer);
      }
    }
  }
}
