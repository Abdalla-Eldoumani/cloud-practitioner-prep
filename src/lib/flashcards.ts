import type { Flashcard, Question, ServiceEntry } from "./types";
import { shuffle } from "./exam";

// The flashcard deck builder. A pure function over JSON-serializable inputs (no
// store import here): the page reads the missed ids from $progress and hands the
// data in, exactly like the quiz pages pass the question pool. Self-graded recall
// has NO options, so the option-shuffle / score-by-id / uniformity rules do not
// apply — the only shuffle a deck carries is deck ORDER, per sitting.

export interface DeckInput {
  // The verified service catalog (ALL_SERVICES). Every entry becomes one card.
  services: readonly ServiceEntry[];
  // The full question pool the missed ids resolve against (ALL_QUESTIONS).
  questions: readonly Question[];
  // The learner's missed question ids (from $progress.incorrectQuestions). Each
  // is resolved against `questions`; an unresolvable id is skipped, never thrown.
  missedIds: readonly string[];
}

// Join the correct option ids to their display text so the back of a missed-
// question card shows the answer in words, not option letters. Multi-answer
// questions join with " · " in the question's own option order (stable here; the
// card is read-only, so no per-instance shuffle applies).
function correctAnswerText(question: Question): string {
  const correct = new Set(question.correct);
  const texts = question.options
    .filter((opt) => correct.has(opt.id))
    .map((opt) => opt.text);
  return texts.join(" · ");
}

// One service entry as a card: the name on the front (with the short form when it
// adds signal), the purpose on the back, when-to-use as the supporting detail,
// and the service's own doc reference.
function serviceCard(service: ServiceEntry): Flashcard {
  const front =
    service.shortName && service.shortName !== service.name
      ? `${service.name} (${service.shortName})`
      : service.name;
  return {
    id: `service:${service.id}`,
    kind: "service",
    front,
    back: service.purpose,
    detail: service.whenToUse,
    reference: service.reference,
    sourceId: service.id,
  };
}

// One missed question as a card: the stem on the front, the correct answer
// text(s) on the back, the explanation as detail, and the question's reference.
function questionCard(question: Question): Flashcard {
  return {
    id: `question:${question.id}`,
    kind: "question",
    front: question.stem,
    back: correctAnswerText(question),
    detail: question.explanation,
    reference: question.reference,
    sourceId: question.id,
  };
}

// Build a shuffled flashcard deck from the catalog and the learner's missed
// questions.
//
// - One "service" card per ServiceEntry.
// - One "question" card per missed id that resolves in `questions`; ids that do
//   not resolve (stale/hand-edited) are skipped, never thrown (DoS guard).
// - Card ids are stable (`service:<id>` / `question:<id>`) and unique, so order
//   is stable while a card is on screen and the known/learning keys persist.
// - The returned deck is shuffled (deck ORDER per sitting), and is [] when both
//   sources are empty so the page can render its empty state.
export function buildDeck({
  services,
  questions,
  missedIds,
}: DeckInput): Flashcard[] {
  const cards: Flashcard[] = services.map(serviceCard);

  // Resolve missed ids against the pool, mirroring the engine's id->question
  // reconstruct: build the lookup once, skip anything that does not resolve, and
  // dedupe so a doubly-missed id yields a single card.
  const byId = new Map(questions.map((q) => [q.id, q]));
  const seen = new Set<string>();
  for (const id of missedIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const question = byId.get(id);
    if (question) cards.push(questionCard(question));
  }

  return shuffle(cards);
}
