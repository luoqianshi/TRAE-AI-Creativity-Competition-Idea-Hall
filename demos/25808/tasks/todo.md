# Task Matrix: Meter Rollover & Swap Assistant

## 1. Requirements Analysis
- **Goal**: Add a "Meter Rollover & Swap Assistant" (表计调校与更换账簿功能).
- **Core issue**: When older components are burned, replaced, or reset due to rollover/overflow, the raw reading contrast causes a massive negative usage spike, breaking dashboards and triggering discrepancy errors.
- **Solution**:
  - Introduce a "Meter Swapped / Reset" (换表/清零标记) toggle/parameters for each field in both Daily and Monthly entry forms.
  - When enabled, we store:
    - Whether the meter was changed/reset for this field on this date: `swap_{fieldId} = true`
    - The old meter's final reading (旧表止码): `old_final_{fieldId}` (e.g. 9982.0)
    - The new meter's starting reading (新表起码): `new_start_{fieldId}` (e.g. 0.0 or 10.0)
  - During difference-based utility calculations (daily and monthly), if the day is marked as a "swap/rollover" day, instead of simply `currentVal - prevVal`, the usage formula is adjusted to:
    - `Usage = (old_final_{fieldId} - prevVal) + (currentVal - new_start_{fieldId})`
    - If `old_final_{fieldId}` is not specified, default it to `prevVal` (assuming it was changed right at yesterday's end, so `old_final - prevVal = 0`).
    - If `new_start_{fieldId}` is not specified, default to `0`.
- **Pages/Components to modify**:
  1. `DailyForm.tsx`: Render a elegant "Meter Rollover / Swap" toggle expansion under each input field. Expand to let user specify "旧表止码" and "新表起码" if checked.
  2. `MonthlyForm.tsx`: Similarly, add a "Meter Rollover / Swap" toggle expansion under each monthly secondary meter field. Expand to let user input "旧表止码" and "新表起码".
  3. `pricing.ts`: Update utility generation `getEnrichedDailyRecords` to check for `swap_{fieldId}` on the record and calculate accordingly.
  4. Also update any other places where differences are calculated (e.g., checks, dashboard pages). Let's review where.
  5. `HistoryDailyDetailList.tsx` or other table views: Include a nice indicator (badge/label) where a meter was swapped/reset on that day.
  
## 2. Technical Modifications Plan
### Phase A: Update Core Calculation in `src/utils/pricing.ts`
- Enhance `getEnrichedDailyRecords` to look for swap indicators and calculate consumption as:
  ```ts
  const isSwapped = record[`swap_${f.id}`] === true;
  if (isSwapped) {
    const oldFinal = record[`old_final_${f.id}`] !== undefined ? Number(record[`old_final_${f.id}`]) : prevVal;
    const newStart = record[`new_start_${f.id}`] !== undefined ? Number(record[`new_start_${f.id}`]) : 0;
    const diff = Math.max(0, oldFinal - prevVal) + Math.max(0, currentVal - newStart);
    // multiply by ratio or deal with it
  }
  ```
  We should do the same for water fields, electricity fields, etc.!

### Phase B: Daily Form Updates (`src/components/DailyForm.tsx`)
- Inside `DailyForm`, bind components to state for `swap_{fieldId}`, `old_final_{fieldId}`, and `new_start_{fieldId}`.
- Update `onSubmit` / state updater to capture these and save them into the `抄表记录` object.

### Phase C: Monthly Form Updates (`src/components/MonthlyForm.tsx` & `src/hooks/useMeterRecords.ts`)
- In `MonthlyForm.tsx`, also support rollover toggles when registering monthly circuits.
- In `useMeterRecords.ts`, make sure the monthly form state saving parses and includes `swap_{fieldId}`, `old_final_{fieldId}`, and `new_start_{fieldId}` properly when submitting.

### Phase D: View Indicator & Verification
- Show visual badges for Swapped/Rolled-over fields in the Daily Detail list table and Monthly detail table to make the system feel highly professional.
- Run `lint_applet` and `compile_applet`.
