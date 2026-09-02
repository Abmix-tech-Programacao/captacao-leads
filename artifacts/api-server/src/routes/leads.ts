import { Router, type IRouter } from "express";
import { z } from "zod";
import { processLead } from "../lib/leads";
import {
  isSupabasePermissionError,
  SupabaseRequestError,
} from "../lib/supabase";

const router: IRouter = Router();

const CreateLeadBody = z.object({
  name: z.string().trim().min(2).max(120),
  age: z.coerce.number().int().min(18).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(8).max(40),
  city: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(1000).nullish(),
  source: z.string().trim().max(120).nullish(),
  utm_source: z.string().trim().max(120).nullish(),
  utm_medium: z.string().trim().max(120).nullish(),
  utm_campaign: z.string().trim().max(120).nullish(),
  request_id: z.string().trim().max(120).nullish(),
  privacy_version: z.string().trim().max(30).nullish(),
  consent: z.literal(true),
});

const validationMessages: Record<string, string> = {
  name: "Informe seu nome completo.",
  age: "Informe uma idade válida.",
  email: "Informe um e-mail válido.",
  phone: "Informe um telefone válido.",
  city: "Informe sua cidade.",
  consent: "O consentimento é necessário.",
  notes: "As observações devem ter até 1.000 caracteres.",
};

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn(
      { errors: parsed.error.flatten().fieldErrors },
      "Invalid lead submission",
    );
    res.status(422).json({
      success: false,
      error: "Verifique os campos informados.",
      errors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(
          ([field]) => [field, validationMessages[field] ?? "Valor inválido."],
        ),
      ),
    });
    return;
  }

  try {
    const result = await processLead(parsed.data);
    const status = result.created ? 201 : 200;
    res.status(status).json({
      success: true,
      created: result.created,
      message: result.created ? "Cadastro recebido." : "Cadastro atualizado.",
    });
  } catch (error) {
    req.log.error({ err: error }, "Lead submission failed");
    if (isSupabasePermissionError(error)) {
      res.status(503).json({
        success: false,
        error: "A integração com o banco precisa de uma credencial de servidor.",
      });
      return;
    }

    const status =
      error instanceof SupabaseRequestError && error.providerStatus >= 500
        ? 502
        : 503;
    res.status(status).json({
      success: false,
      error:
        status === 503
          ? "O serviço ainda não está configurado."
          : "Não foi possível processar o cadastro.",
    });
  }
});

export default router;
