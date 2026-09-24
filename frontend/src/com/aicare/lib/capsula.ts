import type { Tables } from "@/integrations/supabase/types";

export type Patient = Tables<"patients">;
export type Medication = Tables<"medications">;
export type DoseLog = Tables<"dose_logs">;

export type DoseStatus = "aguardando" | "tomado" | "atrasado";

export type Dose = {
  medication: Medication;
  when: Date;
  hora: string;
  status: DoseStatus;
  log: DoseLog | null;
};

export function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function descricaoFrequencia(medication: Pick<Medication, "intervalo_horas">) {
  if (medication.intervalo_horas === 24) return "1 vez por dia";
  if (medication.intervalo_horas === 12) return "a cada 12 horas";
  if (medication.intervalo_horas === 8) return "a cada 8 horas";
  if (medication.intervalo_horas === 6) return "a cada 6 horas";
  return `a cada ${medication.intervalo_horas} horas`;
}

function horarioInicial(data: Date, horario: string) {
  const [hora, minuto] = horario.split(":").map(Number);
  const resultado = new Date(data);
  resultado.setHours(Number.isFinite(hora) ? hora : 8, Number.isFinite(minuto) ? minuto : 0, 0, 0);
  return resultado;
}

export function dosesDoDia(medicamentos: Medication[], logs: DoseLog[], data = new Date()): Dose[] {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);

  const doses: Dose[] = [];

  for (const medication of medicamentos) {
    const primeiro = horarioInicial(inicio, medication.primeiro_horario);
    const intervalo = Math.max(1, medication.intervalo_horas || 24);

    for (let quando = new Date(primeiro); quando < fim; quando = new Date(quando.getTime() + intervalo * 60 * 60 * 1000)) {
      const log = logs.find((item) => item.medication_id === medication.id && Math.abs(new Date(item.horario_previsto).getTime() - quando.getTime()) < 60_000) ?? null;
      const agora = Date.now();
      const tolerancia = 15 * 60 * 1000;
      const status: DoseStatus = log ? "tomado" : quando.getTime() + tolerancia < agora ? "atrasado" : "aguardando";

      doses.push({
        medication,
        when: quando,
        hora: quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status,
        log,
      });
    }
  }

  return doses.sort((a, b) => a.when.getTime() - b.when.getTime());
}

export function proximaDose(doses: Dose[]) {
  const aguardando = doses.find((dose) => dose.status === "aguardando");
  if (aguardando) return aguardando;

  return doses.find((dose) => dose.status === "atrasado") ?? null;
}
