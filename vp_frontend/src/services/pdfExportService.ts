import html2pdf from "html2pdf.js";

/**
 * Extract all styles from the document as a string.
 * Includes both <style> and <link> elements.
 */
const extractDocumentStyles = (): string => {
  return Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((style) => style.outerHTML)
    .join("\n");
};

/**
 * Export a DOM element to a PDF.
 * @param refElement The reference to the DOM element to export.
 * @param filename The name of the generated PDF file.
 */
export const exportElementToPDF = (
  refElement: HTMLElement,
  filename: string = "document.pdf"
) => {
  if (!refElement) {
    console.error("Element reference is required for PDF export.");
    return;
  }

  // Clone the element to avoid modifying the original DOM
  const clonedElement = refElement.cloneNode(true) as HTMLElement;

  // Remove elements with the "no-print" class
  clonedElement.querySelectorAll(".no-print").forEach((el) => el.remove());

  // Extract styles from the document
  const styles = extractDocumentStyles();
  console.log("Extracted styles:", styles); // Debugging line to check extracted styles
  // Configure html2pdf options
  const options = {
    margin: 1,
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Ensure cross-origin images are loaded
    },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    styles, // Pass the extracted styles here
  };

  // Generate and download the PDF
  html2pdf()
    .set(options)
    .from(clonedElement.innerHTML)
    .save()
    .catch((error) => {
      console.error("Error generating PDF:", error);
    });
};