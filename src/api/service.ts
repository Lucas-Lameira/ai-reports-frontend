import http from "./http";

export interface PacientePayload {
  nome: string;
  anotacao: string;
}

export interface RelatorioBatchRequest {
  prompt: string;
  pacientes: PacientePayload[];
}

export interface RelatorioResultado {
  nome: string;
  relatorio: string;
  status: "gerado" | "erro";
  erro?: string;
}

export interface RelatorioBatchResponse {
  resultados: RelatorioResultado[];
}

export const gerarRelatoriosBatch = async (
  payload: RelatorioBatchRequest
): Promise<RelatorioBatchResponse> => {
  const { data } = await http.post<RelatorioBatchResponse>(
    "/relatorios/batch",
    payload
  );

  return data;
};