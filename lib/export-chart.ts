// Découpe naïve par nombre de caractères plutôt que par mesure canvas réelle :
// suffisant pour une note de bas de graphique, sans dépendre d'un contexte 2D
// déjà créé.
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const STYLE_PROPERTIES = [
  "fill",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-linejoin",
  "opacity",
  "font-size",
  "font-family",
  "font-weight",
  "text-anchor",
];

// Les éléments de Recharts utilisent souvent des couleurs via variables CSS
// (`var(--primary)`, `currentColor`, etc.), résolues normalement par la
// feuille de style de la page. Une fois le SVG sérialisé et chargé isolément
// dans une <img> (pour la conversion en PNG), ce contexte CSS disparaît et
// ces couleurs ne se résolvent plus (rendu noir ou invisible). On fige donc,
// avant sérialisation, la valeur *déjà calculée* de chaque élément du SVG
// d'origine (encore attaché au DOM) sur le clone qu'on exporte.
function inlineComputedStyles(source: Element, target: Element): void {
  const sourceEls = source.querySelectorAll("*");
  const targetEls = target.querySelectorAll("*");
  sourceEls.forEach((sourceEl, index) => {
    const targetEl = targetEls[index];
    if (!targetEl) return;
    const computed = window.getComputedStyle(sourceEl);
    const styleText = STYLE_PROPERTIES.map((prop) => {
      const value = computed.getPropertyValue(prop);
      return value ? `${prop}:${value}` : "";
    })
      .filter(Boolean)
      .join(";");
    targetEl.setAttribute("style", styleText);
  });
}

// Un conteneur de graphique Recharts peut contenir plusieurs <svg> : la
// légende rend elle-même une petite icône <svg> par série (~14×14px), qui
// apparaît souvent avant le <svg class="recharts-surface"> du graphique lui-
// même dans l'ordre du DOM. Un simple querySelector("svg") attrape donc cette
// icône minuscule au lieu du graphique — on prend le plus grand svg trouvé.
export function findChartSvg(container: Element): SVGSVGElement | null {
  const svgs = Array.from(container.querySelectorAll("svg")) as SVGSVGElement[];
  if (svgs.length === 0) return null;
  return svgs.reduce((largest, current) => {
    const largestArea = largest.getBoundingClientRect().width * largest.getBoundingClientRect().height;
    const currentArea = current.getBoundingClientRect().width * current.getBoundingClientRect().height;
    return currentArea > largestArea ? current : largest;
  });
}

export interface ChartLegendEntry {
  label: string;
  color: string;
}

export function downloadSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  options?: { title?: string; legend?: ChartLegendEntry[]; note?: string; scale?: number }
): void {
  const scale = options?.scale ?? 2;
  const titleHeight = options?.title ? 32 : 0;
  // Recharts affiche sa <Legend> comme un élément HTML séparé, à côté du
  // <svg> — elle n'existe donc pas dans le SVG qu'on exporte. On la redessine
  // nous-mêmes sur le canvas final à partir des mêmes couleurs que le
  // graphique, pour qu'elle apparaisse bien sur l'image téléchargée.
  const legendHeight = options?.legend?.length ? 26 : 0;
  const headerHeight = titleHeight + legendHeight;
  // La note explicative (astérisque) affichée sous le graphique dans l'appli
  // est elle aussi hors du <svg> — redessinée en pied de page sur le PNG,
  // avec un retour à la ligne simple si elle dépasse la largeur du graphique.
  const noteLines = options?.note ? wrapText(options.note, 90) : [];
  const noteHeight = noteLines.length ? 14 + noteLines.length * 14 : 0;
  const rect = svg.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  inlineComputedStyles(svg, clone);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(
    new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  );

  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = (height + headerHeight + noteHeight) * scale;

    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(svgUrl);
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (options?.title) {
      context.fillStyle = "#1D2026";
      context.font = `700 ${16 * scale}px Anuphan, sans-serif`;
      context.textBaseline = "top";
      context.fillText(options.title, 12 * scale, 10 * scale);
    }

    if (options?.legend?.length) {
      const swatchSize = 11 * scale;
      const gapAfterSwatch = 6 * scale;
      const gapBetweenEntries = 18 * scale;
      const legendY = titleHeight * scale + 6 * scale;
      context.font = `${13 * scale}px Inter, sans-serif`;
      context.textBaseline = "middle";
      let x = 12 * scale;
      for (const entry of options.legend) {
        context.fillStyle = entry.color;
        context.fillRect(x, legendY, swatchSize, swatchSize);
        x += swatchSize + gapAfterSwatch;
        context.fillStyle = "#1D2026";
        context.fillText(entry.label, x, legendY + swatchSize / 2);
        x += context.measureText(entry.label).width + gapBetweenEntries;
      }
    }

    context.drawImage(image, 0, headerHeight * scale, width * scale, height * scale);

    if (noteLines.length) {
      context.fillStyle = "#6b7280";
      context.font = `${11 * scale}px Inter, sans-serif`;
      context.textBaseline = "top";
      const noteY = (headerHeight + height) * scale + 10 * scale;
      noteLines.forEach((line, index) => {
        const prefix = index === 0 ? "* " : "  ";
        context.fillText(`${prefix}${line}`, 12 * scale, noteY + index * 14 * scale);
      });
    }

    URL.revokeObjectURL(svgUrl);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };
  image.onerror = () => URL.revokeObjectURL(svgUrl);
  image.src = svgUrl;
}
