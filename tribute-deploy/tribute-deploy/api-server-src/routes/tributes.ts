import { Router } from "express";
import { db, tributesTable, insertTributeSchema } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { appendTribute } from "../sheets";

const router = Router();

router.get("/tributes", async (req, res) => {
  try {
    const tributes = await db
      .select()
      .from(tributesTable)
      .orderBy(desc(tributesTable.createdAt));
    res.json(tributes);
  } catch (err) {
    req.log.error({ err }, "Failed to list tributes");
    res.status(500).json({ error: "Failed to fetch tributes" });
  }
});

router.get("/tributes/stats", async (req, res) => {
  try {
    const recentTributes = await db
      .select()
      .from(tributesTable)
      .orderBy(desc(tributesTable.createdAt))
      .limit(3);

    const allTributes = await db.select().from(tributesTable);
    const totalCount = allTributes.length;

    res.json({ totalCount, recentTributes });
  } catch (err) {
    req.log.error({ err }, "Failed to get tribute stats");
    res.status(500).json({ error: "Failed to fetch tribute stats" });
  }
});

router.patch("/tributes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const parsed = insertTributeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [updated] = await db
      .update(tributesTable)
      .set(parsed.data)
      .where(eq(tributesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Tribute not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update tribute");
    res.status(500).json({ error: "Failed to update tribute" });
  }
});

router.delete("/tributes/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  try {
    const deleted = await db
      .delete(tributesTable)
      .where(eq(tributesTable.id, id))
      .returning();
    if (deleted.length === 0) {
      res.status(404).json({ error: "Tribute not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete tribute");
    res.status(500).json({ error: "Failed to delete tribute" });
  }
});

router.get("/tributes/export", async (req, res) => {
  try {
    const tributes = await db
      .select()
      .from(tributesTable)
      .orderBy(desc(tributesTable.createdAt));

    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["ID", "Name", "Relationship", "Message", "Submitted At"].map(escape).join(",");
    const rows = tributes.map(t =>
      [t.id, t.authorName, t.relationship, t.message, t.createdAt.toISOString()].map(escape).join(",")
    );
    const csv = [header, ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="testimonies.csv"');
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Failed to export tributes");
    res.status(500).json({ error: "Failed to export tributes" });
  }
});

router.post("/tributes", async (req, res) => {
  const parsed = insertTributeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  try {
    const [tribute] = await db
      .insert(tributesTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(tribute);
    appendTribute(
      tribute.authorName,
      tribute.relationship,
      tribute.message,
      tribute.createdAt.toISOString()
    ).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to create tribute");
    res.status(500).json({ error: "Failed to create tribute" });
  }
});

export default router;
