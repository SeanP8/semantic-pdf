"use client";
import { useCallback, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

type PDFFile = string | File | null;

const resizeObserverOptions = {};
const maxWidth = 800;

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const [file, setFile] = useState<PDFFile>(pdf_url);
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <div>
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;

//https://docs.google.com/gview?url=https://sean-chatpdf.s3.us-east-2.amazonaws.com/uploads/1697907288315the-great-gatsby.pdf&embedded=true

// https://sean-chatpdf.s3.us-east-2.amazonaws.com/uploads/1697907288315the-great-gatsby.pdf

//     src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}

// src="https://docs.google.com/viewer?url=https://sean-chatpdf.s3.us-east-2.amazonaws.com/uploads/1698020584630is-followed-by-me.md"
