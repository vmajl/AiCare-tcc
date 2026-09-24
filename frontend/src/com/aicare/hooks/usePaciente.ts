import { useEffect, useState } from "react";

export function usePacienteSelecionado(ids: string[]) {
  const [pacienteId, setPacienteId] = useState<string | null>(null);

  useEffect(() => {
    if (pacienteId && ids.includes(pacienteId)) return;
    setPacienteId(ids[0] ?? null);
  }, [ids, pacienteId]);

  return {
    pacienteId,
    selecionar: (id: string) => setPacienteId(id),
  };
}
