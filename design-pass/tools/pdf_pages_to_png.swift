// Render PDF pages to PNG (macOS, PDFKit). Pair with LibreOffice headless
// (soffice --headless --convert-to pdf deck.pptx) for slide thumbnails.
// Usage: swift pdf_pages_to_png.swift deck.pdf out/prefix FIRST LAST  (scale 0.5 => 960px wide for 26.67in decks)
import Foundation
import PDFKit
import AppKit
let a = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: a[1]))!
for i in (Int(a[3])!-1)..<Int(a[4])! {
  let p = doc.page(at: i)!; let r = p.bounds(for: .mediaBox); let s: CGFloat = 0.5
  let img = NSImage(size: NSSize(width: r.width*s, height: r.height*s))
  img.lockFocus(); NSColor.white.set(); NSRect(x:0,y:0,width:r.width*s,height:r.height*s).fill()
  let ctx = NSGraphicsContext.current!.cgContext; ctx.scaleBy(x: s, y: s); p.draw(with: .mediaBox, to: ctx); img.unlockFocus()
  let rep = NSBitmapImageRep(data: img.tiffRepresentation!)!
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "\(a[2])_\(i+1).png"))
}
