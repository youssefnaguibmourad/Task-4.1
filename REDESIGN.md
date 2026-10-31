# UI/UX Rescue — what was wrong and what changed

Scenario: a student **picks a course → reads past feedback → reviews a different course**.
Nothing from the original was removed. Every old feature still works (create/edit, one review per course, ratings 1–5, search, rating filter, course lookup, shareable `#/courses/CODE` pages, teaching history, Reset demo, localStorage).

## 1. Bugs (the app said or did the wrong thing)

| Problem | Example | Fix |
|---|---|---|
| "Your reviews" searched for the text "You" | Farida's comment *"**You** learn the most…"* showed up as yours | A real **Only my reviews** filter based on the owner (`owner === 'you'`) |
| The donut chart was hard-coded | It always showed the same 65%/80% split, whatever the data | The ring now fills to `average / 5` |
| Dates always said "Recently" | A review from August and one from today looked the same | Real dates (e.g. *6 Oct 2026*), plus a sort option (newest/oldest/highest/lowest) |
| The **Apply** button did nothing | Filters already updated as you typed; the button only showed a fake "applied" message | Removed it, and the screen now says "Filters apply as you type" |
| "Write review" on a course page opened an empty form | You were on MATH204 but had to type MATH204 again | The form is pre-filled with that course code |
| You only learned about the duplicate review after pressing Submit | You typed CSEN701, wrote a comment, then got "already reviewed" | A warning appears as soon as you type the code, with an **Edit that review instead** button, and Submit is disabled. On a course you already reviewed, the button says **Edit your review** |
| Success messages only showed on the home screen | Posting from a course page showed no confirmation | Messages show on every page, close on their own after a few seconds, and have a "View course" link |
| Reset demo erased everything in one click, with no warning | A misclick next to the heading wiped all your reviews | It asks you to confirm first, and moved to a small link under the table |

## 2. The scenario was hard to follow

- **Picking a course:** before, the only way in was a single text box, "Course score lookup", pre-filled with CSEN701. Now there is a **Courses** list that shows every course with its name, average, stars, number of reviews and a "You reviewed" tag. You can filter it by code *or* name (e.g. typing "linear" finds MATH204). Typing an unknown code such as `ABCD123` still opens its details page, the same as the old lookup.
- **Reading feedback:** the course page now puts student reviews first (the reason you came), with the star breakdown next to the average. Your own review is highlighted and shown at the top. There is a breadcrumb back to *Courses*.
- **Writing the review:** you click stars instead of picking from an unlabeled 1–5 dropdown. Each star has a word (*4 – Very good*). The course-code box suggests codes from the catalog and shows the course name (*✓ Linear Algebra*) so you can catch typos. The form says which fields are required and which are optional.
- **Navigation:** the sidebar now has a **Courses** entry. The highlighted item matches the page you are on (before, the course page highlighted nothing useful).

## 3. Accessibility and readability

- Most text was 10–11 px light grey (about 3:1 contrast). Body text is now 14–15 px, and grey text meets 4.5:1.
- On tablets the sidebar showed only icons, so screen readers heard nothing. Every icon button now has a label and a tooltip.
- Star ratings are read aloud as "4 out of 5 stars" instead of "black star black star…".
- The modal closes with **Esc**, keeps keyboard focus inside itself, focuses the first useful field, and puts focus back where you were when it closes.
- Visible focus outlines, real `<label>`s, table headers with `scope`, and a live region for the "Showing X of Y" count.
- **Phones:** the 900 px-wide table needed sideways scrolling. It now turns into stacked cards, and the sidebar becomes a sticky top bar.
