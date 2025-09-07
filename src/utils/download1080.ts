// utils/download1080.ts
import * as htmlToImage from "html-to-image";

async function waitImagesLoaded(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.decode ? img.decode().catch(() => {}) : Promise.resolve()
    )
  );
  if ((document as any).fonts?.ready) await (document as any).fonts.ready;
}

/**
 * Paksa output 1080x1920 tanpa bergantung ukuran layar.
 * @param srcEl   elemen asli yang ingin di-capture (mis: ref.current)
 * @param designW lebar desain aslinya di UI (mis: 540 atau 720)
 * @param designH tinggi desain aslinya di UI (mis: 960 atau 1280)
 */
export async function downloadAs1080x1920(
  srcEl: HTMLElement,
  designW: number,
  designH: number
) {
  // 1) clone elemen agar tak mengganggu layout
  const clone = srcEl.cloneNode(true) as HTMLElement;

  // 2) taruh clone di off-screen
  Object.assign(clone.style, {
    position: "fixed",
    left: "-100000px",
    top: "0",
    // Set ukuran "desain" aslinya supaya layout tetap sama
    width: `${designW}px`,
    height: `${designH}px`,
    // Skala ke 1080x1920 secara proporsional
    transformOrigin: "top left",
    transform: `scale(${1080 / designW})`,
  } as CSSStyleDeclaration);

  document.body.appendChild(clone);

  // 3) tunggu gambar & font
  await waitImagesLoaded(clone);

  // 4) export PNG 1080x1920 (pixelRatio=1 karena sudah kita scale)
  const dataUrl = await htmlToImage.toPng(clone, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: true,
    // Optional: background putih
    // backgroundColor: "#fff",
    // Pastikan tidak ada transform lain yang mengacaukan
    style: { transform: clone.style.transform, transformOrigin: "top left" },
    filter: (node) => !node.classList?.contains("no-capture"),
  });

  // 5) bersihkan
  document.body.removeChild(clone);

  // 6) unduh
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "export-1080x1920.png";
  a.click();
}
