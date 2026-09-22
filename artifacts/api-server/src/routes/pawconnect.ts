import { Router, type IRouter } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  animalsTable,
  appointmentsTable,
  emergenciesTable,
  reportsTable,
  vetsTable,
} from "@workspace/db";
import {
  AskAssistantBody,
  AskAssistantResponse,
  CreateAnimalBody,
  CreateAnimalResponse,
  CreateAppointmentBody,
  CreateAppointmentResponse,
  CreateEmergencyBody,
  CreateEmergencyResponse,
  CreateReportBody,
  CreateReportResponse,
  Dashboard,
  GetAnimalParams,
  GetAnimalResponse,
  GetDashboardResponse,
  ListAnimalsQueryParams,
  ListAnimalsResponse,
  ListEmergenciesResponse,
  ListReportsQueryParams,
  ListReportsResponse,
  ListVetsResponse,
  UpdateAnimalBody,
  UpdateAnimalParams,
  UpdateAnimalResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const asIso = (value: Date | string | null | undefined): string =>
  value instanceof Date ? value.toISOString() : value ?? new Date().toISOString();

const animalResponse = (animal: typeof animalsTable.$inferSelect) => ({
  ...animal,
  createdAt: asIso(animal.createdAt),
});

const emergencyResponse = (emergency: typeof emergenciesTable.$inferSelect) => ({
  ...emergency,
  createdAt: asIso(emergency.createdAt),
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const [
    [activeEmergencies],
    [animalsForAdoption],
    [nearbyVets],
    [openReports],
    recentEmergencies,
    recentReports,
  ] = await Promise.all([
    db.select({ value: count() }).from(emergenciesTable).where(eq(emergenciesTable.status, "open")),
    db.select({ value: count() }).from(animalsTable).where(ilike(animalsTable.status, "available")),
    db.select({ value: count() }).from(vetsTable),
    db.select({ value: count() }).from(reportsTable).where(eq(reportsTable.status, "open")),
    db.select().from(emergenciesTable).orderBy(desc(emergenciesTable.createdAt)).limit(3),
    db.select().from(reportsTable).orderBy(desc(reportsTable.id)).limit(2),
  ]);

  const activity = [
    ...recentEmergencies.map((item) => ({
      id: item.id,
      title: item.title,
      detail: `${item.location} · ${item.urgency} priority`,
      time: asIso(item.createdAt),
      kind: "emergency",
    })),
    ...recentReports.map((item) => ({
      id: 10000 + item.id,
      title: `${item.type === "lost" ? "Lost" : "Found"} report: ${item.name}`,
      detail: item.location,
      time: item.date,
      kind: "report",
    })),
  ].slice(0, 5);

  res.json(
    GetDashboardResponse.parse({
      activeEmergencies: Number(activeEmergencies.value),
      animalsForAdoption: Number(animalsForAdoption.value),
      nearbyVets: Number(nearbyVets.value),
      openReports: Number(openReports.value),
      recentActivity: activity,
    }),
  );
});

router.get("/animals", async (req, res): Promise<void> => {
  const parsed = ListAnimalsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { species, status, search } = parsed.data;
  const filters = [
    species ? ilike(animalsTable.species, species) : undefined,
    status ? ilike(animalsTable.status, status) : undefined,
    search
      ? or(
          ilike(animalsTable.name, `%${search}%`),
          ilike(animalsTable.breed, `%${search}%`),
          ilike(animalsTable.location, `%${search}%`),
        )
      : undefined,
  ].filter(Boolean);
  const animals = await db
    .select()
    .from(animalsTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(animalsTable.createdAt));
  res.json(ListAnimalsResponse.parse(animals.map(animalResponse)));
});

router.post("/animals", async (req, res): Promise<void> => {
  const parsed = CreateAnimalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [animal] = await db.insert(animalsTable).values(parsed.data).returning();
  res.status(201).json(CreateAnimalResponse.parse(animalResponse(animal)));
});

router.get("/animals/:id", async (req, res): Promise<void> => {
  const params = GetAnimalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [animal] = await db.select().from(animalsTable).where(eq(animalsTable.id, params.data.id));
  if (!animal) {
    res.status(404).json({ error: "Animal not found" });
    return;
  }
  res.json(GetAnimalResponse.parse(animalResponse(animal)));
});

router.patch("/animals/:id", async (req, res): Promise<void> => {
  const params = UpdateAnimalParams.safeParse(req.params);
  const parsed = UpdateAnimalBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [animal] = await db
    .update(animalsTable)
    .set(parsed.data)
    .where(eq(animalsTable.id, params.data.id))
    .returning();
  if (!animal) {
    res.status(404).json({ error: "Animal not found" });
    return;
  }
  res.json(UpdateAnimalResponse.parse(animalResponse(animal)));
});

router.get("/emergencies", async (_req, res): Promise<void> => {
  const emergencies = await db.select().from(emergenciesTable).orderBy(desc(emergenciesTable.createdAt));
  res.json(ListEmergenciesResponse.parse(emergencies.map(emergencyResponse)));
});

router.post("/emergencies", async (req, res): Promise<void> => {
  const parsed = CreateEmergencyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [emergency] = await db.insert(emergenciesTable).values(parsed.data).returning();
  res.status(201).json(CreateEmergencyResponse.parse(emergencyResponse(emergency)));
});

router.get("/reports", async (req, res): Promise<void> => {
  const parsed = ListReportsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const reports = await db
    .select()
    .from(reportsTable)
    .where(parsed.data.type ? eq(reportsTable.type, parsed.data.type) : undefined)
    .orderBy(desc(reportsTable.id));
  res.json(ListReportsResponse.parse(reports));
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [report] = await db.insert(reportsTable).values(parsed.data).returning();
  res.status(201).json(CreateReportResponse.parse(report));
});

router.get("/vets", async (_req, res): Promise<void> => {
  const vets = await db.select().from(vetsTable).orderBy(desc(vetsTable.availableToday), vetsTable.name);
  res.json(
    ListVetsResponse.parse(
      vets.map((vet) => ({ ...vet, rating: Number(vet.rating) })),
    ),
  );
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [appointment] = await db.insert(appointmentsTable).values(parsed.data).returning();
  res.status(201).json(CreateAppointmentResponse.parse(appointment));
});

router.post("/assistant", async (req, res): Promise<void> => {
  const parsed = AskAssistantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const message = parsed.data.message.toLowerCase();
  const urgent = /(breath|bleed|bleeding|seizure|poison|unconscious|hit by|accident|vomit.*weak)/.test(message);
  const response = {
    urgency: urgent ? "urgent" : "routine",
    guidance: urgent
      ? "The signs you described may need prompt veterinary attention. Keep the animal calm, avoid giving human medicine, and contact the nearest emergency vet now."
      : "Start with rest, clean water, and close observation. Note when the symptoms started and any changes in appetite, movement, or behavior.",
    nextSteps: urgent
      ? ["Use Emergency SOS to alert nearby rescuers.", "Call the nearest veterinary clinic.", "Keep a photo or short video ready for the vet."]
      : ["Track symptoms for the next few hours.", "Book a vet appointment if symptoms continue.", "Keep vaccination and medical records updated."],
    disclaimer: "This is general guidance, not a diagnosis. A qualified veterinarian should assess the animal.",
  };
  res.json(AskAssistantResponse.parse(response));
});

export default router;