import { Router } from "express";
import { db, rsvpTable, insertRsvpSchema, attendanceValues } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { appendRsvp } from "../sheets";

const router = Router();

router.get("/rsvp/stats", async (req, res) => {
  try {
    const rows = await db.select().from(rsvpTable);
    const total = rows.length;
    const inPerson = rows.filter(r => r.attendance === attendanceValues[0]).length;
    const virtual = rows.filter(r => r.attendance === attendanceValues[1]).length;
    const notAttending = rows.filter(r => r.attendance === attendanceValues[2]).length;
    res.json({ total, inPerson, virtual, notAttending });
  } catch (err) {
    req.log.error({ err }, "Failed to get RSVP stats");
    res.status(500).json({ error: "Failed to fetch RSVP stats" });
  }
});

router.get("/rsvp", async (req, res) => {
  try {
    const rsvps = await db.select().from(rsvpTable).orderBy(desc(rsvpTable.createdAt));
    res.json(rsvps);
  } catch (err) {
    req.log.error({ err }, "Failed to list RSVPs");
    res.status(500).json({ error: "Failed to fetch RSVPs" });
  }
});

router.get("/rsvp/export", async (req, res) => {
  try {
    const rsvps = await db.select().from(rsvpTable).orderBy(desc(rsvpTable.createdAt));

    const escape = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["ID", "Full Name", "Phone", "Attendance", "Submitted At"].map(escape).join(",");
    const rows = rsvps.map(r =>
      [r.id, r.fullName, r.phone, r.attendance, r.createdAt.toISOString()].map(escape).join(",")
    );
    const csv = [header, ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="rsvps.csv"');
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Failed to export RSVPs");
    res.status(500).json({ error: "Failed to export RSVPs" });
  }
});

router.post("/rsvp", async (req, res) => {
  const parsed = insertRsvpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [rsvp] = await db.insert(rsvpTable).values(parsed.data).returning();
    res.status(201).json(rsvp);
    appendRsvp(
      rsvp.fullName,
      rsvp.phone,
      rsvp.attendance,
      rsvp.createdAt.toISOString()
    ).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to create RSVP");
    res.status(500).json({ error: "Failed to submit RSVP" });
  }
});

export default router;
