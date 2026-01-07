import { uploadToGoogleDrive } from "../config/googleDrive.js";
import Purchase from "../models/purchase.model.js";
import LocalPurchase from "../models/localpurchase.model.js";
import crypto from "crypto";

/* ------------------ Indian Holidays (YYYY-MM-DD) ------------------ */
const INDIAN_HOLIDAYS = [
  "2025-01-26",
  "2025-08-15",
  "2025-10-02",
  "2025-12-25",
];

/* ------------------ Helper Functions ------------------ */

// Check Sunday or holiday
const isHoliday = (date) => {
  const yyyyMmDd = date.toISOString().split("T")[0];
  return date.getDay() === 0 || INDIAN_HOLIDAYS.includes(yyyyMmDd);
};

// Add working days
const addWorkingDays = (startDate, days) => {
  let date = new Date(startDate);
  let count = 0;

  while (count < days) {
    date.setDate(date.getDate() + 1);
    if (!isHoliday(date)) count++;
  }
  return date;
};

// Calculate delay in days only
const calculateDelayDays = (planned, actual) => {
  const msDiff = actual - planned;
  if (msDiff <= 0) return "0 days";
  const days = Math.floor(msDiff / (1000 * 60 * 60 * 24));
  return `${days} days`;
};

/* ------------------ Planned Date Logic (PC Follow Up) ------------------
   IMPORTANT:
   - We store planned fields as strings in Mongo.
   - For PC Follow Up 2 we generate a deterministic "random" time between 10:00–18:00 IST
     and store as an ISO timestamp (UTC). This keeps the planned value stable across fetches.
*/

const parseYyyyMmDd = (s) => {
  if (!s || typeof s !== "string") return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  return { y, mo, d };
};

const addDaysToDateOnly = (yyyyMmDd, daysToAdd) => {
  const parts = parseYyyyMmDd(yyyyMmDd);
  if (!parts) return "";
  const dt = new Date(Date.UTC(parts.y, parts.mo - 1, parts.d, 0, 0, 0, 0));
  dt.setUTCDate(dt.getUTCDate() + Number(daysToAdd || 0));
  return dt.toISOString().slice(0, 10); // YYYY-MM-DD
};

// Create a UTC Date that corresponds to IST local time.
// Example: 2025-12-10 10:15 IST -> stored as UTC ISO.
const makeUtcDateFromIst = ({ y, mo, d, hour, minute }) => {
  // Start from UTC midnight of that date, then shift back by IST offset (5h30m)
  // so that the resulting UTC time represents IST midnight.
  const IST_OFFSET_MIN = 330;
  const baseUtcMs = Date.UTC(y, mo - 1, d, 0, 0, 0, 0) - IST_OFFSET_MIN * 60 * 1000;
  const timeMs = (Number(hour) * 60 + Number(minute)) * 60 * 1000;
  return new Date(baseUtcMs + timeMs);
};

const deterministicRandInt = (seed, min, max) => {
  const h = crypto.createHash("md5").update(String(seed)).digest("hex");
  const n = parseInt(h.slice(0, 8), 16); // 32-bit
  const span = max - min + 1;
  return min + (n % span);
};

const computePlannedPcFollowUp1 = (leadDays, poDate) => {
  const k = Number(leadDays);
  if (!poDate || !Number.isFinite(k) || k <= 0) return "";
  if (k <= 7) return addDaysToDateOnly(poDate, 1);
  if (k <= 15) return addDaysToDateOnly(poDate, 6);
  if (k <= 21) return addDaysToDateOnly(poDate, 12);
  if (k <= 30) return addDaysToDateOnly(poDate, 15);
  if (k <= 45) return addDaysToDateOnly(poDate, 15);
  if (k <= 60) return addDaysToDateOnly(poDate, 20);
  if (k <= 90) return addDaysToDateOnly(poDate, 25);
  return ""; // > 90
};

const computePlannedPcFollowUp2 = (leadDays, poDate, seed) => {
  const k = Number(leadDays);
  if (!poDate || !Number.isFinite(k) || k <= 0) return "";
  if (k <= 7) return "";
  if (k > 90) return "";

  const parts = parseYyyyMmDd(poDate);
  if (!parts) return "";

  // Planned = PO DATE + (LeadDays - 1) + random time (10 AM–6 PM) in IST
  const daysToAdd = k - 1;
  const baseDateOnly = addDaysToDateOnly(poDate, daysToAdd);
  const baseParts = parseYyyyMmDd(baseDateOnly);
  if (!baseParts) return "";

  const hour = deterministicRandInt(`${seed}-h`, 10, 18);
  const minute = deterministicRandInt(`${seed}-m`, 0, 59);
  const dt = makeUtcDateFromIst({ ...baseParts, hour, minute });
  return dt.toISOString();
};

const computePlannedPcFollowUp3 = (leadDays, poDate) => {
  const k = Number(leadDays);
  if (!poDate || !Number.isFinite(k) || k <= 0) return "";
  if (k < 31) return "";
  if (k >= 31 && k <= 45) return addDaysToDateOnly(poDate, 42);
  if (k >= 46 && k <= 60) return addDaysToDateOnly(poDate, 56);
  if (k >= 61 && k <= 90) return addDaysToDateOnly(poDate, 80);
  return ""; // > 90
};

const applyPcPlannedDates = (updateData, existingDoc) => {
  const poDate =
    Object.prototype.hasOwnProperty.call(updateData, "poDate")
      ? updateData.poDate
      : existingDoc?.poDate;
  const leadDays =
    Object.prototype.hasOwnProperty.call(updateData, "leadDays")
      ? updateData.leadDays
      : existingDoc?.leadDays;
  const uniqueId =
    Object.prototype.hasOwnProperty.call(updateData, "uniqueId")
      ? updateData.uniqueId
      : existingDoc?.uniqueId;

  if (!poDate) return; // no PO date → can't compute

  const k = Number(leadDays);
  if (!Number.isFinite(k) || k <= 0) {
    // Lead days not valid/available → don't overwrite existing planned values.
    return;
  }

  const seed = `${uniqueId || ""}-${poDate}-${k}`;

  updateData.plannedPCFollowUp1 = computePlannedPcFollowUp1(k, poDate);
  updateData.plannedPCFollowUp2 = computePlannedPcFollowUp2(k, poDate, seed);
  updateData.plannedPCFollowUp3 = computePlannedPcFollowUp3(k, poDate);
};


/* ------------------ Payment Planned-Date Helpers ------------------ */

const computePlannedPaymentPWP = (poDate) => {
  if (!poDate) return "";
  // Planned = PO DATE + 2 days (calendar days)
  return addDaysToDateOnly(poDate, 2);
};

const computePlannedPaymentBBD = (poDate, leadDays) => {
  if (!poDate) return "";
  const k = Number(leadDays);
  if (!Number.isFinite(k) || k <= 0) return "";
  // Planned = (PO DATE + Lead Days) - 7 days  => PO DATE + (Lead Days - 7)
  return addDaysToDateOnly(poDate, k - 7);
};

const computePlannedPaymentFAR = (storeReceivedDate) => {
  if (!storeReceivedDate) return "";
  // Planned = Store Received Date + 12 days
  return addDaysToDateOnly(storeReceivedDate, 12);
};

const computePlannedPaymentPAPW = (poDate, papwDays) => {
  if (!poDate) return "";
  const d = Number(papwDays);
  if (!Number.isFinite(d) || d <= 0) return "";
  // Planned = PO DATE + PAPWDays (Lead Days not included)
  return addDaysToDateOnly(poDate, d);
};

const paymentConditionHas = (paymentCondition, token) => {
  const c = String(paymentCondition || "").toUpperCase();
  return c.includes(token.toUpperCase());
};

const applyPaymentPlannedDates = (updateData, existingDoc) => {
  // Pull values from updateData (if present) else from existingDoc
  const poDate =
    Object.prototype.hasOwnProperty.call(updateData, "poDate")
      ? updateData.poDate
      : existingDoc?.poDate;

  const leadDays =
    Object.prototype.hasOwnProperty.call(updateData, "leadDays")
      ? updateData.leadDays
      : existingDoc?.leadDays;

  const storeReceivedDate =
    Object.prototype.hasOwnProperty.call(updateData, "storeReceivedDate")
      ? updateData.storeReceivedDate
      : existingDoc?.storeReceivedDate;

  const paymentCondition =
    Object.prototype.hasOwnProperty.call(updateData, "paymentCondition")
      ? updateData.paymentCondition
      : existingDoc?.paymentCondition;

  const papwDays =
    Object.prototype.hasOwnProperty.call(updateData, "papwDays")
      ? updateData.papwDays
      : existingDoc?.papwDays;

  // Always compute if required base fields exist.
  if (poDate) {
    updateData.plannedPaymentPWP = computePlannedPaymentPWP(poDate);
  }

  if (poDate && Number.isFinite(Number(leadDays)) && Number(leadDays) > 0) {
    updateData.plannedPaymentBBD = computePlannedPaymentBBD(poDate, leadDays);
  }

  if (storeReceivedDate) {
    updateData.plannedPaymentFAR = computePlannedPaymentFAR(storeReceivedDate);
  }

  // PAPW planned is relevant only when payment condition involves PAPW
  if (poDate && paymentConditionHas(paymentCondition, "PAPW")) {
    updateData.plannedPaymentPAPW = computePlannedPaymentPAPW(poDate, papwDays);
  } else {
    // If PAPW isn't selected, don't show a planned PAPW date.
    updateData.plannedPaymentPAPW = "";
  }
};


/* ------------------ Material Received Planned-Date Helpers ------------------ */

// Planned (Material Received) = PO Date + Lead Days,
// but if the resulting time crosses 7:00 PM (IST) OR falls on a holiday/Sunday,
// roll forward to the next working day (skipping Sundays + configured holidays).
//
// Why this shape:
// - Your sheet logic combines a simple "PO + Lead Days" with business-hour aware rollover.
// - UI shows only the date part, but rollover affects which date is shown.
const computePlannedMaterialReceived = (poDate, leadDays) => {
  if (!poDate) return "";
  const k = Number(leadDays);
  if (!Number.isFinite(k) || k <= 0) return "";

  // Convert PO date to a Date object.
  // Accepts: Date, ISO string, or YYYY-MM-DD.
  let base;
  if (poDate instanceof Date) {
    base = new Date(poDate.getTime());
  } else if (typeof poDate === "string") {
    // YYYY-MM-DD -> treat as UTC midnight (stable across environments)
    const parts = parseYyyyMmDd(poDate);
    base = parts
      ? new Date(Date.UTC(parts.y, parts.mo - 1, parts.d, 0, 0, 0, 0))
      : new Date(poDate);
  } else {
    base = new Date(poDate);
  }
  if (Number.isNaN(base.getTime())) return "";

  // Step-1: add Lead Days (calendar days)
  base.setUTCDate(base.getUTCDate() + k);

  // Business hour logic is in IST.
  const IST_OFFSET_MIN = 330;
  const toIst = (d) => new Date(d.getTime() + IST_OFFSET_MIN * 60 * 1000);
  const toUtcFromIst = (dIst) => new Date(dIst.getTime() - IST_OFFSET_MIN * 60 * 1000);

  const isHolidayIst = (dIst) => {
    const ymd = dIst.toISOString().slice(0, 10);
    const dow = dIst.getUTCDay(); // day-of-week in IST because dIst is already shifted
    return dow === 0 || INDIAN_HOLIDAYS.includes(ymd);
  };

  // Work with IST-shifted date so hour/day checks match your sheet behaviour.
  let ist = toIst(base);

  // If time is >= 19:00 IST, push to next working day at 10:00 IST.
  const OFFICE_START_HOUR_IST = 10;
  if (ist.getUTCHours() >= 19) {
    ist.setUTCDate(ist.getUTCDate() + 1);
    ist.setUTCHours(OFFICE_START_HOUR_IST, 0, 0, 0);
  }

  // Skip Sunday + configured holidays.
  while (isHolidayIst(ist)) {
    ist.setUTCDate(ist.getUTCDate() + 1);
    ist.setUTCHours(OFFICE_START_HOUR_IST, 0, 0, 0);
  }

  // Store as date-only (YYYY-MM-DD) because the UI renders planned dates as date values.
  // The time component is only used to decide rollover.
  const finalUtc = toUtcFromIst(ist);
  return finalUtc.toISOString().slice(0, 10);
};

// Actual = Store Received Date (preferred) else PSE Material Received Date
const computeActualMaterialReceived = (materialReceivedDate, storeReceivedDate) => {
  const s = String(storeReceivedDate || "");
  if (s) return s;
  const m = String(materialReceivedDate || "");
  if (m) return m;
  return "";
};

const applyMaterialReceivedDates = (updateData, existingDoc) => {
  const poDate =
    Object.prototype.hasOwnProperty.call(updateData, "poDate")
      ? updateData.poDate
      : existingDoc?.poDate;

  const leadDays =
    Object.prototype.hasOwnProperty.call(updateData, "leadDays")
      ? updateData.leadDays
      : existingDoc?.leadDays;

  const materialReceivedDate =
    Object.prototype.hasOwnProperty.call(updateData, "materialReceivedDate")
      ? updateData.materialReceivedDate
      : existingDoc?.materialReceivedDate;

  const storeReceivedDate =
    Object.prototype.hasOwnProperty.call(updateData, "storeReceivedDate")
      ? updateData.storeReceivedDate
      : existingDoc?.storeReceivedDate;

  // Planned date based on PO + Lead Days
  const planned = computePlannedMaterialReceived(poDate, leadDays);
  if (planned) updateData.plannedMaterialReceived = planned;

  // Actual date based on store date (preferred) else PSE date
  const actual = computeActualMaterialReceived(materialReceivedDate, storeReceivedDate);
  if (actual) updateData.actualMaterialReceived = actual;

  // Time delay when both planned+actual exist
  if (planned && actual) {
    const plannedDt = new Date(planned);
    const actualDt = new Date(actual);
    if (!Number.isNaN(plannedDt.getTime()) && !Number.isNaN(actualDt.getTime())) {
      updateData.timeDelayMaterialReceived = calculateDelayDays(plannedDt, actualDt);
    }
  }
};

/* ------------------ Controller ------------------ */

export const updatePurchase = async (req, res) => {
  try {
    const updateData = { ...req.body };

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    /* =========================================================
     * ✅ STORE AUTO-CALCULATION + INVOICE HISTORY (NO OVERRIDE)
     *
     * Balance Qty = Total Quantity (DB) - Received Quantity
     * - storeBalanceQuantity is always computed by backend
     * - invoice edits are appended to storeInvoiceHistory[]
     * - Store Person HIPL can still edit Status→Remarks (no restriction here)
     * ========================================================= */

    const hasStoreReceivedQtyUpdate = Object.prototype.hasOwnProperty.call(updateData, "storeReceivedQuantity");
    const hasInvoiceNoUpdate = Object.prototype.hasOwnProperty.call(updateData, "storeInvoiceNumber");
    const hasInvoiceDateUpdate = Object.prototype.hasOwnProperty.call(updateData, "storeInvoiceDate");

    // Never trust client-provided balance
    if (Object.prototype.hasOwnProperty.call(updateData, "storeBalanceQuantity")) {
      delete updateData.storeBalanceQuantity;
    }

    const totalQty =
      Number(
        purchase.totalQuantity ??
        purchase.totalQty ??
        purchase.totalQTY ??
        0
      ) || 0;

    // Determine received qty for calculations (use incoming if provided else existing)
    let receivedQtyForCalc = hasStoreReceivedQtyUpdate
      ? Number(updateData.storeReceivedQuantity ?? 0)
      : Number(purchase.storeReceivedQuantity ?? 0);

    if (!Number.isFinite(receivedQtyForCalc)) receivedQtyForCalc = 0;
    // ✅ Allow over-receipt (received > total) so Store can record excess material.
    // Balance will still be computed as max(0, total - received).
    receivedQtyForCalc = Math.max(0, receivedQtyForCalc);

    const balanceForCalc = Math.max(0, totalQty - receivedQtyForCalc);

    // If received qty updated, store computed balance
    if (hasStoreReceivedQtyUpdate) {
      updateData.storeReceivedQuantity = receivedQtyForCalc;
      updateData.storeBalanceQuantity = balanceForCalc;

      // Optional: auto-set status when fully received (only if user didn't send any)
      if (balanceForCalc === 0 && !Object.prototype.hasOwnProperty.call(updateData, "storeStatus")) {
        updateData.storeStatus = purchase.storeStatus ?? "Received";
      }
    }

    // Invoice history: push a snapshot when invoice no/date actually changes
    if (hasInvoiceNoUpdate || hasInvoiceDateUpdate) {
      const nextInvoiceNo = hasInvoiceNoUpdate
        ? String(updateData.storeInvoiceNumber ?? "")
        : String(purchase.storeInvoiceNumber ?? "");

      const nextInvoiceDate = hasInvoiceDateUpdate
        ? String(updateData.storeInvoiceDate ?? "")
        : String(purchase.storeInvoiceDate ?? "");

      const prevInvoiceNo = String(purchase.storeInvoiceNumber ?? "");
      const prevInvoiceDate = String(purchase.storeInvoiceDate ?? "");

      const isChanged = nextInvoiceNo !== prevInvoiceNo || nextInvoiceDate !== prevInvoiceDate;

      if (isChanged) {
        purchase.storeInvoiceHistory = purchase.storeInvoiceHistory || [];
        purchase.storeInvoiceHistory.push({
          invoiceNumber: nextInvoiceNo,
          invoiceDate: nextInvoiceDate,
          changedAt: new Date(),
          receivedQuantitySnapshot: receivedQtyForCalc,
          receivedDateSnapshot: String(updateData.storeReceivedDate ?? purchase.storeReceivedDate ?? ""),
          balanceQuantitySnapshot: balanceForCalc,
        });
      }

      // Keep latest values also updated for display
      updateData.storeInvoiceNumber = nextInvoiceNo;
      updateData.storeInvoiceDate = nextInvoiceDate;
    }

    /* -------- (i) Planned Get Quotation -------- */
    if (purchase.date) {
      const baseDate = new Date(purchase.date); // YYYY-MM-DD
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedGetQuotation = plannedDate.toISOString().split("T")[0];
    }

    /* -------- (ii) Time Delay Calculation (Get Quotation) -------- */
    if (updateData.actualGetQuotation && purchase.plannedGetQuotation) {
      const planned = new Date(purchase.plannedGetQuotation);
      const actual = new Date(updateData.actualGetQuotation);
      updateData.timeDelayGetQuotation = calculateDelayDays(planned, actual);
    }

    /* -------- (iii) Planned Technical Approval -------- */
    if (updateData.actualGetQuotation) {
      const baseDate = new Date(updateData.actualGetQuotation);
      const plannedTechDate = addWorkingDays(baseDate, 3);
      updateData.plannedTechApproval = plannedTechDate.toISOString().split("T")[0];
    }

    /* -------- (iv) Time Delay Calculation (Technical Approval) -------- */
    if (updateData.actualTechApproval && purchase.plannedTechApproval) {
      const planned = new Date(purchase.plannedTechApproval);
      const actual = new Date(updateData.actualTechApproval);
      updateData.timeDelayTechApproval = calculateDelayDays(planned, actual);
    }

    /* -------- (v) Planned Commercial Negotiation -------- */
    if (updateData.actualTechApproval) {
      const baseDate = new Date(updateData.actualTechApproval);
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedCommercialNegotiation = plannedDate.toISOString().split("T")[0];
    }

    /* -------- (vi) Time Delay Calculation (Commercial Negotiation) -------- */
    if (updateData.actualCommercialNegotiation && purchase.plannedCommercialNegotiation) {
      const planned = new Date(purchase.plannedCommercialNegotiation);
      const actual = new Date(updateData.actualCommercialNegotiation);
      updateData.timeDelayCommercialNegotiation = calculateDelayDays(planned, actual);
    }

    /* -------- (vii) Planned PO Generation -------- */
    if (updateData.actualCommercialNegotiation) {
      const baseDate = new Date(updateData.actualCommercialNegotiation);
      const plannedDate = addWorkingDays(baseDate, 3);
      updateData.plannedPoGeneration = plannedDate.toISOString().split("T")[0];
    }

    /* -------- (viii) Time Delay Calculation (PO Generation) -------- */
    if (updateData.actualPoGeneration && purchase.plannedPoGeneration) {
      const planned = new Date(purchase.plannedPoGeneration);
      const actual = new Date(updateData.actualPoGeneration);
      updateData.timeDelayPoGeneration = calculateDelayDays(planned, actual);
    }

    /* -------- (ix) Planned Payment Follow Ups (PWP/BBD/FAR/PAPW) -------- */
    // Auto-compute payment planned dates when PO Date / Lead Days / Store Received Date / PAPWDays change.
    applyPaymentPlannedDates(updateData, purchase);

    /* -------- (ix-a) Material Received (Planned/Actual/Delay) -------- */
    // Planned = PO DATE + Lead Days; Actual = Store Received Date (preferred) else PSE Material Received Date
    applyMaterialReceivedDates(updateData, purchase);


    /* -------- (ix-b) Planned PC Follow Ups (1/2/3) -------- */
    // Auto-compute PC planned dates whenever PO Date / Lead Days are present.
    // (Does not affect any other module.)
    applyPcPlannedDates(updateData, purchase);

    /* -------- (x) Time Delay PWP -------- */
    if (updateData.actualPaymentPWP && purchase.plannedPaymentPWP) {
      const planned = new Date(purchase.plannedPaymentPWP);
      const actual = new Date(updateData.actualPaymentPWP);
      updateData.timeDelayPaymentPWP = calculateDelayDays(planned, actual);
    }

    
    if (updateData.actualPaymentBBD && (updateData.plannedPaymentBBD || purchase.plannedPaymentBBD)) {
      const planned = new Date(updateData.plannedPaymentBBD || purchase.plannedPaymentBBD);
      const actual = new Date(updateData.actualPaymentBBD);
      updateData.timeDelayPaymentBBD = calculateDelayDays(planned, actual);
    }

    if (updateData.actualPaymentFAR && (updateData.plannedPaymentFAR || purchase.plannedPaymentFAR)) {
      const planned = new Date(updateData.plannedPaymentFAR || purchase.plannedPaymentFAR);
      const actual = new Date(updateData.actualPaymentFAR);
      updateData.timeDelayPaymentFAR = calculateDelayDays(planned, actual);
    }

    if (updateData.actualPaymentPAPW && (updateData.plannedPaymentPAPW || purchase.plannedPaymentPAPW)) {
      const planned = new Date(updateData.plannedPaymentPAPW || purchase.plannedPaymentPAPW);
      const actual = new Date(updateData.actualPaymentPAPW);
      updateData.timeDelayPaymentPAPW = calculateDelayDays(planned, actual);
    }
// Apply updateData on the loaded doc (so invoice history changes are saved too)
    purchase.set(updateData);
    const updated = await purchase.save();

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


export const updateLocalPurchase = async (req, res) => {
  try {
    const updateData = { ...req.body };

    //const localpurchase = await LocalPurchase.findById(req.params.id);

    const updated = await LocalPurchase.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Create
export const createIndentForm = async (req, res) => {
  try {
    const body = { ...req.body };
    // Compute PC planned dates at creation time if PO Date is already present.
    // This keeps planned values stable and avoids frontend-side recompute.
    applyPcPlannedDates(body, body);
    applyPaymentPlannedDates(body, body);
    applyMaterialReceivedDates(body, body);
    const form = await Purchase.create(body);
    return res.status(201).json({
      success: true,
      message: "Indent Form Created Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Creating Indent Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createLocalPurchaseForm = async (req, res) => {
  try {
    const form = await LocalPurchase.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Local Purchase Form Created Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Creating Local Purchase Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getLatestUniqueId = async (req, res) => {
  try {
    const lastRecord = await Purchase.findOne().sort({ createdAt: -1 });

    console.log("📌 Last record fetched from DB:", lastRecord);

    // If no previous record found → start from "INT2_12000"
    if (!lastRecord) {
      console.log("ℹ️ No previous record found. Starting uniqueId from INT2_12000.");
      return res.json({
        success: true,
        uniqueId: "INT2_12000"
      });
    }

    const prevId = lastRecord.uniqueId;  // Example: "INT2_12000"
    console.log("🔍 Unique ID from DB:", prevId);

    // Split prefix and numeric part
    const [prefix, numPart] = prevId.split("_");

    // Convert only numeric part
    const newNumber = Number(numPart) + 1;

    // Rebuild new ID
    const newUniqueId = `${prefix}_${newNumber}`;

    console.log("✅ New Generated Unique ID:", newUniqueId);

    return res.json({
      success: true,
      uniqueId: newUniqueId
    });

  } catch (error) {
    console.error("❌ Error Fetching Latest Unique ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

//++++++++++++++++++++++++++++++++++
export const getLatestLocalPurchaseUniqueId = async (req, res) => {
  try {
    const lastRecord = await LocalPurchase.findOne().sort({ createdAt: -1 });

    console.log("📌 Last record fetched from DB:", lastRecord);

    // If no previous record found → start from "INT2_12000"
    if (!lastRecord) {
      console.log("ℹ️ No previous record found. Starting uniqueId from INTLP2_12000.");
      return res.json({
        success: true,
        uniqueId: "INTLP2_12000"
      });
    }

    const prevId = lastRecord.uniqueId;  // Example: "INTLP2_12000"
    console.log("🔍 Unique ID from DB:", prevId);

    // Split prefix and numeric part
    const [prefix, numPart] = prevId.split("_");

    // Convert only numeric part
    const newNumber = Number(numPart) + 1;

    // Rebuild new ID
    const newUniqueId = `${prefix}_${newNumber}`;

    console.log("✅ New Generated Unique ID:", newUniqueId);

    return res.json({
      success: true,
      uniqueId: newUniqueId
    });

  } catch (error) {
    console.error("❌ Error Fetching Latest Unique ID:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================
// Update Purchase Status Fields (Custom Route)
// ==========================
// export const updatePurchase = async (req, res) => {
//   try {
//     const updateData = req.body;

//     const updated = await Purchase.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     return res.json({ success: true, data: updated });
//   } catch (error) {
//     console.error("❌ Update error:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

//?????????????????????????????????????????????????????????????

// Get All
// export const getAllIndentForms = async (req, res) => {
//   try {
//     const forms = await Purchase.find().sort({ createdAt: 1 });
//     return res.json({ success: true, data: forms });
//   } catch (error) {
//     console.error("❌ Error Fetching Forms:", error);
//     return res.status(500).json({ success: false, error: error.message });
//   }
// };

//----------------------------------------------------
export const getAllIndentForms = async (req, res) => {
  try {
    const { role, username } = req.body;

    let filter = {};

    if (role === "PSE") {
      filter = { submittedBy: username };
    } else if (role === "PA") {
      filter = { doerName: username };
    }

    const forms = await Purchase.find(filter).sort({ createdAt: 1 });

    // Ensure PC planned dates are available for UI even for older records.
    // We do NOT persist here; we only enrich the response.
    const enriched = forms.map((doc) => {
      const obj = doc.toObject();
      const k = Number(obj.leadDays);
      if (obj.poDate && Number.isFinite(k) && k > 0) {
        if (!obj.plannedPCFollowUp1) obj.plannedPCFollowUp1 = computePlannedPcFollowUp1(k, obj.poDate);
        if (!obj.plannedPCFollowUp2) obj.plannedPCFollowUp2 = computePlannedPcFollowUp2(k, obj.poDate, `${obj.uniqueId || ""}-${obj.poDate}-${k}`);
        if (!obj.plannedPCFollowUp3) obj.plannedPCFollowUp3 = computePlannedPcFollowUp3(k, obj.poDate);
      }
      
      // Ensure Payment planned dates are available for UI even for older records.
      if (obj.poDate) {
        if (!obj.plannedPaymentPWP) obj.plannedPaymentPWP = computePlannedPaymentPWP(obj.poDate);
        const lk = Number(obj.leadDays);
        if (Number.isFinite(lk) && lk > 0) {
          if (!obj.plannedPaymentBBD) obj.plannedPaymentBBD = computePlannedPaymentBBD(obj.poDate, lk);
        }
        // PAPW planned only when condition involves PAPW
        if (paymentConditionHas(obj.paymentCondition, "PAPW")) {
          if (!obj.plannedPaymentPAPW) obj.plannedPaymentPAPW = computePlannedPaymentPAPW(obj.poDate, obj.papwDays);
        }
      }
      if (obj.storeReceivedDate) {
        if (!obj.plannedPaymentFAR) obj.plannedPaymentFAR = computePlannedPaymentFAR(obj.storeReceivedDate);
      }

      // Ensure Material Received planned/actual/delay are available for UI even for older records.
      if (obj.poDate) {
        const lk = Number(obj.leadDays);
        if (Number.isFinite(lk) && lk > 0) {
          if (!obj.plannedMaterialReceived) obj.plannedMaterialReceived = computePlannedMaterialReceived(obj.poDate, lk);
        }
      }

      if (!obj.actualMaterialReceived) {
        const actualMr = computeActualMaterialReceived(obj.materialReceivedDate, obj.storeReceivedDate);
        if (actualMr) obj.actualMaterialReceived = actualMr;
      }

      if (obj.plannedMaterialReceived && obj.actualMaterialReceived && !obj.timeDelayMaterialReceived) {
        const plannedDt = new Date(obj.plannedMaterialReceived);
        const actualDt = new Date(obj.actualMaterialReceived);
        if (!Number.isNaN(plannedDt.getTime()) && !Number.isNaN(actualDt.getTime())) {
          obj.timeDelayMaterialReceived = calculateDelayDays(plannedDt, actualDt);
        }
      }
return obj;
    });

    return res.json({
      success: true,
      data: enriched,
    });

  } catch (error) {
    console.error("❌ Error Fetching Forms:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAllLocalPurchaseForms = async (req, res) => {
  try {
    const { role, username } = req.body;

    let filter = {};

    if (role === "PSE") {
      filter = { submittedBy: username };
    } else if (role === "PA") {
      filter = { doerName: username };
    }

    const forms = await LocalPurchase.find(filter).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: forms,
    });

  } catch (error) {
    console.error("❌ Error Fetching Forms:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// export const getAllIndentForms = async (req, res) => {
//   try {
//     // Log what frontend sends
//     console.log("📥 Received from Frontend:", {
//       role: req.body.role,
//       username: req.body.username
//     });

//     const { role, username } = req.body;

//     let filter = {};

//     if (role === "PSE") {
//       filter = { submittedBy: username };
//     } else if (role === "PA") {
//       filter = { doerName: username };
//     }

//     // Log the filter condition created by backend
//     console.log("🔎 Applied Filter:", filter);

//     const forms = await Purchase.find(filter).sort({ createdAt: 1 });

//     // Log what backend is sending back
//     console.log("📤 Sending back records:", forms.length);

//     return res.json({
//       success: true,
//       data: forms,
//     });

//   } catch (error) {
//     console.error("❌ Error Fetching Forms:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// };

// Get One
export const getIndentFormById = async (req, res) => {
  try {
    const form = await Purchase.findById(req.params.id);
    if (!form)
      return res.status(404).json({ success: false, message: "Not Found" });

    res.json({ success: true, data: form });
  } catch (error) {
    console.error("❌ Error Fetching Form:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// Fetch by Unique ID (used for Store manual closure UI)
export const getIndentFormByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const form = await Purchase.findOne({ uniqueId });
    if (!form) {
      return res.status(404).json({ success: false, message: "Unique ID not found" });
    }
    return res.json({ success: true, data: form });
  } catch (error) {
    console.error("❌ Error Fetching By Unique ID:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Manual close for Store section (primarily for excess received qty cases)
export const manualCloseStoreByUniqueId = async (req, res) => {
  try {
    const { uniqueId, closedBy = "", reason = "" } = req.body || {};
    if (!uniqueId) {
      return res.status(400).json({ success: false, message: "uniqueId is required" });
    }

    const purchase = await Purchase.findOne({ uniqueId });
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Unique ID not found" });
    }

    const totalQty = Number(purchase.totalQuantity ?? 0) || 0;
    const receivedQty = Number(purchase.storeReceivedQuantity ?? 0) || 0;

    // As per requirement: manual close is mainly for "received > total"
    if (!(receivedQty > totalQty)) {
      return res.status(400).json({
        success: false,
        message: `Manual close allowed only when Store Received Qty (${receivedQty}) is greater than Total Qty (${totalQty}).`,
      });
    }

    purchase.storeManualClosed = true;
    purchase.storeManualClosedAt = new Date();
    purchase.storeManualClosedBy = closedBy;
    purchase.storeManualCloseReason = reason;

    // Mark store as closed & clear balance for closure
    purchase.storeStatus = "Manually Closed";
    purchase.storeBalanceQuantity = 0;

    await purchase.save();

    return res.json({ success: true, message: "Manually closed successfully", data: purchase });
  } catch (error) {
    console.error("❌ Error Manual Closing Store:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Update
export const updateIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return res.json({
      success: true,
      message: "Form Updated Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Updating Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Delete
export const deleteIndentForm = async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Form Deleted Successfully" });
  } catch (error) {
    console.error("❌ Error Deleting Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Approve
export const approveIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        approvedBy: req.body.approvedBy,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Form Approved Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Approving Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Reject
export const rejectIndentForm = async (req, res) => {
  try {
    const form = await Purchase.findByIdAndUpdate(
      req.params.id,
      {
        status: "Rejected",
        rejectedReason: req.body.reason,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Form Rejected Successfully",
      data: form,
    });
  } catch (error) {
    console.error("❌ Error Rejecting Form:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================
// PDF Upload → Google Drive
// ==========================
// export const uploadComparisonPDF = async (req, res) => {
//   try {
//     const { rowId } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ success: false, message: "No file uploaded." });
//     }

//     if (!rowId) {
//       return res.status(400).json({ success: false, message: "Row ID is missing." });
//     }

//     const fileMeta = {
//       name: `comparison_${rowId}.pdf`,
//       parents: ["YOUR_GOOGLE_DRIVE_FOLDER_ID"], // <<< replace here
//     };

//     const fileMedia = {
//       mimeType: "application/pdf",
//       body: Buffer.from(file.buffer),
//     };

//     const uploaded = await drive.files.create({
//       requestBody: fileMeta,
//       media: fileMedia,
//       fields: "id",
//     });

//     const fileId = uploaded.data.id;

//     await drive.permissions.create({
//       fileId,
//       requestBody: { role: "reader", type: "anyone" },
//     });

//     const fileUrl = `https://drive.google.com/file/d/${fileId}/preview`;

//     await Purchase.findByIdAndUpdate(rowId, { comparisonPdf: fileUrl });

//     return res.json({
//       success: true,
//       fileUrl,
//       message: "PDF uploaded & URL saved.",
//     });

//   } catch (error) {
//     console.error("Upload PDF Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

export const uploadComparisonPDF = async (req, res) => {
  try {
    const { rowId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!rowId) {
      return res.status(400).json({
        success: false,
        message: "Row ID missing",
      });
    }

    // 🚀 Upload to Google Drive
    const fileUrl = await uploadToGoogleDrive(file, rowId);

    // 💾 Save URL in DB (ONLY here)
    await Purchase.findByIdAndUpdate(rowId, {
      comparisonPdf: fileUrl,
    });

    return res.status(200).json({
      success: true,
      fileUrl,
    });
  } catch (error) {
    console.error("❌ Upload Comparison PDF Error:", error);
    return res.status(500).json({
      success: false,
      message: "PDF upload failed",
    });
  }
};