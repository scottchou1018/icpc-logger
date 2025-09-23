# ICPC Training Logger — Product Spec (v1)

## Pages & Navigation

1. *Starting Page*

   * *Inputs*

     * Contest name (text, required)
     * Contest duration (HH\:MM, required)
     * Team members (up to 3 text inputs; 1–3 required)
     * Number of tasks (integer 1–26, required)
   * *Derived*

     * Task labels auto-generated: A, B, ..., up to count.
   * *Actions*

     * *Start* (primary): validates inputs → initializes state → navigates to Contest Helper.
   * *Persistence*

     * Save all inputs to localStorage so a reload doesn’t lose anything.

2. *Contest Helper Page* (optimized for speed)

   * *Header*

     * Contest name • *Run-up timer* (00:00:00 since start) • Remaining time (HH:MM:SS) • *End Contest* button.
   * *Main*

     * *Three equal-width, full-height buttons* (or fewer depending on team size), labeled with member names.

       * *Idle state*: neutral color, label “Idle”.
       * *Active state*: *red*, shows Task + Operation + elapsed (e.g., “B • Implementing • 12:34”).
     * *Tap/Click flow (min clicks, no typing):*

       1. Click member button → *Task Picker* (sheet/modal, not a new route to keep speed): grid/list of A…
       2. Pick task → *Operation Picker* (sheet/modal): {Reading, Thinking, Implementing}
       3. Confirm instantly creates a new *operation record* for that member and task, sets member state to Active.
     * *Stopping an operation:* click the member’s red button → confirm “Stop current operation?” → stop & save end timestamp → button returns to Idle.
   * *Rules*

     * One active operation *per member* at a time; members can switch (stop then start).
     * Members can act on any task any number of times (multiple segments).
     * Timer and all records keep running across refresh (persist to localStorage).
   * *Optional (nice to have, still v1-friendly)*

     * Quick filters panel (collapsed): per-member feed, per-task feed (read-only).
     * Undo last stop/start (single-step).

3. *End Page*

   * Shown when: countdown reaches zero *or* user clicks *End Contest*.
   * *Summary*

     * Contest name, duration, actual elapsed, members, tasks count.
   * *Exports*

     * *Download CSV (Detailed Log)* – canonical, machine-readable.
     * *Download CSV (Per-Task, 3 Columns)* – matches your “three columns / one row per problem” requirement (see format below).
   * *Safety*

     * Confirm end (“You can’t add more records after ending. Export before leaving.”).
     * Keep data in localStorage until user clears (avoid accidental loss).

---

## Data Model

type MemberId = string;  // slug of name
type TaskId = string;    // 'A'...'Z'
type OperationType = 'Reading' | 'Thinking' | 'Implementing';

interface AppState {
  contest: {
    name: string;
    durationMs: number;        // from starting page
    startedAt: number;         // epoch ms
    endedAt?: number;          // epoch ms
    members: { id: MemberId; name: string }[];
    tasks: TaskId[];           // ['A','B',...]
  };
  // At most one active per member
  active: Record<MemberId, {
    task: TaskId;
    op: OperationType;
    startedAtOffsetMs: number; // ms since start
  } | null>;
  // Full history (append-only)
  records: {
    memberId: MemberId;
    task: TaskId;
    op: OperationType;
    startMs: number; // offset from contest start in ms
    endMs: number;   // offset from contest start in ms
  }[];
}

*Timebase:* store offsets from contest start in *milliseconds*; show as HH:MM:SS in UI.

*Constraints & Validations*

* Members: 1–3, unique non-empty names (trimmed).
* Tasks: 1–26.
* Duration: 5 minutes–10 hours (suggested bounds), HH\:MM.

---

## State Transitions (per member)

Idle  --select(task, op)-->  Active(task, op, t0)
Active --click(stop)-------> Idle (record segment [t0, t1])

* If user starts a new operation while Active: prompt to stop the current one first.

---

## Timer Behavior

* *Run-up*: now - startedAt. Ticks each second.
* *Countdown*: duration - runUp. When <= 0, auto-stop all actives, mark endedAt, navigate to End Page.
* Page reload safe: restore from localStorage.

---

## CSV Exports

### 1) *Detailed Log (recommended)*

Long/tidy format—lossless.

Columns:

* Task (A…)
* Member
* Operation (Reading|Thinking|Implementing)
* Start (sec from start) (integer seconds)
* End (sec from start)
* Duration (sec)

Example rows:

Task,Member,Operation,Start (s),End (s),Duration (s)
A,Alice,Reading,0,120,120
A,Alice,Thinking,120,420,300
B,Bob,Implementing,300,1500,1200

### 2) *Per-Task (3 Columns)* — matches your “three columns, one row per problem”

* *One row per task*, *exactly three member columns* in team order.
* Each cell contains *all segments* for that member on that task as a compact string:

  * Format per segment: <Op>@<Start>-<End> times in HH:MM (from contest start)
  * Multiple segments separated by |
* If a member has no segments for that task, leave the cell empty.

Columns:

* Task, Member1 (Name), Member2 (Name), Member3 (Name) (omit columns for missing members if team < 3).

Example:

Task,Alice,Bob,Carol
A,Reading@00:00-02:00 | Thinking@02:00-07:00,Implementing@05:00-25:00,
B,,Reading@10:00-12:00 | Thinking@12:00-22:00,Implementing@08:00-13:30

Why two CSVs? Your wide, 3-column format is great for quick reviews, but it can’t represent rows cleanly if there are many segments; the detailed log guarantees nothing is lost.


---

## UX Details (fast & low-friction)

* *Large touch targets:* min height 120px for member buttons; text scales.
* *Two-tap logging:* Member → Task → Operation (two sheets; enter confirms).
* *Keyboard nav:* Arrow keys pick task; 1/2/3 for operation; Enter confirm.
* *Strong color semantics:* red = active; neutral/gray = idle.
* *Accessibility:* ARIA labels; high contrast; focus outlines.
* *Offline-first:* Fully client-side; no network required; data in localStorage.

---
