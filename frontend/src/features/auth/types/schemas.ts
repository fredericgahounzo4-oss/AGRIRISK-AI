import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis.").email("Format d'email invalide."),
  password: z.string().min(6, "6 caractères minimum."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "2 caractères minimum."),
    email: z.string().min(1, "L'email est requis.").email("Format d'email invalide."),
    password: z.string().min(6, "6 caractères minimum."),
    confirmPassword: z.string().min(6, "6 caractères minimum."),
    role: z.enum(["Agriculteur", "Vétérinaire"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
