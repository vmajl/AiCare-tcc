export type Sugestao = {
  nome: string;
  dosagem: string;
  intervalo_horas: number;
  primeiro_horario: string;
  continuo: boolean;
  data_fim: string | null;
  instrucoes: string;
  quantidade_estoque: number;
  unidade_estoque: string;
};

export type MensagemAssistente = {
  role: "user" | "assistant";
  content: string;
};

type ConversaInput = {
  mensagens: MensagemAssistente[];
  pacienteNome: string;
};

type ConversaOutput = {
  resposta: string;
  sugestao: Sugestao | null;
};

const UNIDADES = ["comprimidos", "cápsulas", "gotas", "ampolas", "sachês", "unidades", "caixas"];

function extrairIntervalo(texto: string) {
  const match = texto.match(/(?:a cada|de)\s+(\d+)\s*(?:em\s*\d+|horas?)/i);
  if (match) return Number(match[1]);

  if (/\b12\s*em\s*12\b/i.test(texto)) return 12;
  if (/\b8\s*em\s*8\b/i.test(texto)) return 8;
  if (/\b6\s*em\s*6\b/i.test(texto)) return 6;
  if (/\b24\s*em\s*24\b/i.test(texto)) return 24;
  if (/\b1\s*(?:vez|x)\s*(?:ao|por)\s*dia\b/i.test(texto)) return 24;

  return 24;
}

function extrairDosagem(texto: string) {
  return texto.match(/\b\d+(?:[.,]\d+)?\s*(?:mg|g|mcg|µg|ml|mL|%)\b/i)?.[0] ?? "";
}

function extrairHorario(texto: string) {
  return texto.match(/\b(?:[01]?\d|2[0-3])[:h][0-5]\d\b/i)?.[0]?.replace("h", ":") ?? "08:00";
}

function extrairEstoque(texto: string) {
  const match = texto.match(/(?:estoque|tenho|possuo)\s*(?:de)?\s*(\d+(?:[.,]\d+)?)\s*([a-záéíóúãõç]+)?/i);
  if (!match) return { quantidade: 0, unidade: "unidades" };

  const quantidade = Number(match[1].replace(",", "."));
  const unidadeInformada = match[2]?.toLowerCase();
  const unidade = UNIDADES.find((item) => item.startsWith(unidadeInformada ?? "")) ?? "unidades";

  return { quantidade: Number.isFinite(quantidade) ? quantidade : 0, unidade };
}

function extrairNome(texto: string) {
  const limpeza = texto
    .replace(/\b(?:a cada|de)\s+\d+\s*(?:em\s*\d+|horas?)\b/gi, "")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:mg|g|mcg|µg|ml|mL|%)\b/gi, "")
    .replace(/\b(?:uso contínuo|uso continuo)\b/gi, "")
    .replace(/\b(?:tenho|possuo|estoque)\s*\d+(?:[.,]\d+)?\s*\w*\b/gi, "")
    .replace(/[,.]/g, " ")
    .trim();

  const palavras = limpeza.split(/\s+/).filter(Boolean);
  return palavras.slice(0, 4).join(" ") || "Medicamento";
}

export async function conversarComAssistente({ mensagens, pacienteNome }: ConversaInput): Promise<ConversaOutput> {
  const ultimoTexto = [...mensagens].reverse().find((mensagem) => mensagem.role === "user")?.content?.trim() ?? "";

  if (!ultimoTexto) {
    return {
      resposta: pacienteNome
        ? `Certo. Me conte o nome do medicamento, a dosagem e de quanto em quanto tempo ${pacienteNome} precisa tomar.`
        : "Certo. Me conte o nome do medicamento, a dosagem e de quanto em quanto tempo precisa tomar.",
      sugestao: null,
    };
  }

  const intervalo_horas = extrairIntervalo(ultimoTexto);
  const dosagem = extrairDosagem(ultimoTexto);
  const primeiro_horario = extrairHorario(ultimoTexto);
  const estoque = extrairEstoque(ultimoTexto);
  const continuo = /uso\s*cont[ií]nuo|cont[ií]nuo/i.test(ultimoTexto);

  const sugestao: Sugestao = {
    nome: extrairNome(ultimoTexto),
    dosagem: dosagem || "Informar dosagem",
    intervalo_horas,
    primeiro_horario,
    continuo,
    data_fim: null,
    instrucoes: "",
    quantidade_estoque: estoque.quantidade,
    unidade_estoque: estoque.unidade,
  };

  return {
    resposta: "Entendi. Confira os dados abaixo antes de salvar o medicamento.",
    sugestao,
  };
}
