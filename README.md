# Math cards

Flash cards for first-grade math, made for one kid at one desk. Runs entirely in the browser;
nothing leaves the machine.

## What it does

- Addition and subtraction from 1 + 1 up to 2-digit + 2-digit (about 80% of cards), plus
  comparisons (>, <, =, ≠), shapes cut into halves/thirds/quarters, skip-counting sequences,
  number line, the 1–100 grid, and missing-number equations.
- Right answers get a confetti burst and a happy chime. Wrong answers show the answer and a picture
  of why: counting dots for small sums, ten frames for "make ten", tens-and-ones blocks plus the
  worked columns for 2-digit problems.
- Problems that need carrying or borrowing are entered right to left in boxes, one step at a time:
  ones, carry (0 if none), tens.
- Every attempt is remembered. Harder and recently missed problems come up more often, with known
  easy ones mixed in for confidence. The Progress page shows what she is great at and what needs work.

## Run it

```
npm install
npm run dev
```

Open the printed localhost URL. Type digits on the keyboard; Enter submits or moves to the next card.

## Progress data

Progress lives in the browser's localStorage. Use Settings to export it to a JSON file (backup or
move to another computer) or import one.

## Develop

```
npm test        # unit tests (Vitest)
npm run build   # typecheck + production build into dist/
```
