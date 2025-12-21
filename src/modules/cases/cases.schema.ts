import { z } from "zod";

export const openCaseSchema = z.object({
  clientSeed: z.string().optional(),
});

export type OpenCaseDTO = z.infer<typeof openCaseSchema>;
