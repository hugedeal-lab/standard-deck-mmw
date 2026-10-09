# Code-interpreter probe (GPT / Gemini)

Turn on ONE code interpreter, start a new chat, attach a non-confidential
.pptx, and paste:

```
Feasibility test -- do not redesign anything.
1. Open the attached .pptx with python-pptx (print the library version).
2. Print: slide count; for each slide, its layout name; the set of fonts used
   in text runs; the 10 most common RGB colours.
3. Change every text run whose font is Calibri, Calibri Light, Helvetica or
   Helvetica Neue to Arial. Change nothing else.
4. Save as <original name>_designpass_probe.pptx and give me the file as a
   download link.
5. Report any step that failed and the exact error.
```

Pass = steps 1-4 complete AND the downloaded file opens cleanly in
PowerPoint with only fonts changed. Note which interpreter you used.
