<template>
  <v-container fluid>
    <!-- PROMPT UI -->
    <v-expansion-panels class="mb-4">
        <v-expansion-panel>
            <v-expansion-panel-title>
            Ajustar prompt do relatório
            </v-expansion-panel-title>

            <v-expansion-panel-text>
            <v-textarea
                v-model="promptAtual"
                rows="10"
                label="Prompt utilizado na geração"
            />

            <div class="d-flex justify-end mt-2">
                <v-btn
                  variant="text"
                  color="secondary"
                  @click="restaurarPrompt"
                >
                  Restaurar padrão
                </v-btn>
            </div>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>

    <!-- ADD PACIENTES -->
    <v-card class="mb-4">
      <v-card-title>Adicionar paciente</v-card-title>

      <v-card-text class="d-flex flex-column flex-md-row gap-2">
        <v-text-field
          v-model="novoPaciente"
          label="Nome do paciente"
          class="flex-grow-1"
        />

        <v-btn color="primary" @click="addUser">
          Adicionar
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- DESKTOP -->
    <v-data-table
      v-if="!isMobile"
      :headers="headers"
      :items="pacientes"
      item-value="id"
      show-select
      v-model:selected="selecionados"
    >
      <template #item.anotacao="{ item }">
        <v-textarea
          v-model="item.anotacao"
          density="compact"
          auto-grow
          rows="3"
          placeholder="Digite a anotação..."
        />
      </template>
    </v-data-table>

    <!-- MOBILE: CARDS -->
    <v-row v-else>
      <v-col
        v-for="paciente in pacientes"
        :key="paciente.id"
        cols="12"
      >
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            {{ paciente.nome }}

            <v-checkbox
              v-model="selecionados"
              :value="paciente"
              density="compact"
            />
          </v-card-title>

          <v-card-text>
            <v-textarea
              v-model="paciente.anotacao"
              auto-grow
              rows="3"
              placeholder="Digite a anotação..."
            />

            <v-chip
              v-if="paciente.status === 'gerando'"
              color="warning"
              size="small"
            >
              Gerando...
            </v-chip>

            <v-chip
              v-if="paciente.status === 'gerado'"
              color="success"
              size="small"
            >
              Gerado
            </v-chip>

            <v-chip
              v-if="paciente.status === 'erro'"
              color="error"
              size="small"
            >
              Erro
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- BOTÃO FIXO MOBILE -->
    <v-btn
      v-if="isMobile"
      color="primary"
      class="generate-btn"
      @click="gerarRelatorios"
      :loading="loading"
    >
      Gerar relatórios
    </v-btn>

    <!-- BOTÃO DESKTOP -->
    <v-btn
      v-else
      color="primary"
      class="mt-4"
      @click="gerarRelatorios"
      :loading="loading"
    >
      Gerar relatórios selecionados
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { gerarRelatoriosBatch } from "@/api/service";

interface Paciente {
  id: number;
  nome: string;
  anotacao: string;
  status?: "idle" | "gerando" | "gerado" | "erro";
  relatorio?: string;
}

const router = useRouter();
const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);
const novoPaciente = ref<string>("");
const pacientes = ref<Paciente[]>([]);
const selecionados = ref<Paciente[]>([]);
const loading = ref<boolean>(false);

const promptPadrao = `
    Elabore um relatório terapêutico no modelo TIP (Treino de Independência Pessoal), com linguagem técnica, clara e objetiva, organizado nos seguintes tópicos:

    Com base nas anotações que vou te passar, gere um relatório com:

    1. Objetivos Terapêuticos:
    Descrever objetivos voltados para autonomia no momento do lanche/refeição, independência ao servir-se, habilidade de comer sozinho(a), permanência à mesa, organização funcional e coordenação motora, conforme aplicável ao caso.

    2. Programas de Intervenção e Atividades Desenvolvidas:
    Descrever detalhadamente:
        •	Atividade principal realizada (ex: kit cozinha, treino de servir-se, organização de utensílios, transferência de alimentos, etc.);
        •	Participação da criança (nível de engajamento);
        •	Tipo de mediação necessária (verbal, gestual, física leve, suporte mínimo, supervisão);
        •	Desempenho na permanência à mesa e postura;
        •	Nível de autonomia ao comer sozinho(a);
        •	Habilidade de transferir alimentos/organizar utensílios;
        •	Indícios de evolução (coordenação motora, planejamento da ação, compreensão de comandos);
        •	Presença de oscilações atencionais ou necessidade de redirecionamento.

    3. Observações:
    Descrever:
        •	Nível de engajamento geral;
        •	Necessidade de mediação;
        •	Compreensão das instruções;
        •	Pontos de evolução;
        •	Aspectos que ainda demandam intervenção;
        •	Considerações clínicas sobre autonomia e organização funcional.

    Utilizar linguagem profissional voltada para contexto clínico terapêutico.
`;
const promptAtual = ref<string>(promptPadrao);

const headers = [
  { title: "Nome", key: "nome" },
  { title: "Anotação", key: "anotacao" },
];

const addUser = (): void => {
  if (!novoPaciente.value.trim()) return;

  const novo: Paciente = {
    id: Date.now(),
    nome: novoPaciente.value,
    anotacao: "",
  };

  pacientes.value.unshift(novo);
  selecionados.value.unshift(novo);
  novoPaciente.value = "";
};


const gerarRelatorios = async (): Promise<void> => {
  if (!selecionados.value.length) return;

  loading.value = true;

  try {
    const payload = {
      prompt: promptAtual.value,
      pacientes: selecionados.value.map((p) => ({
        nome: p.nome,
        anotacao: p.anotacao,
      })),
    };

    const response = await gerarRelatoriosBatch(payload);

    response.resultados.forEach((resultado) => {
      const paciente = pacientes.value.find(
        (p) => p.nome === resultado.nome
      );

      if (!paciente) return;

      if (resultado.status === "gerado") {
        paciente.status = "gerado";
        paciente.relatorio = resultado.relatorio;
      } else {
        paciente.status = "erro";
      }
    });

    localStorage.setItem(
      "relatorios",
      JSON.stringify(response.resultados)
    );

    router.push("/relatorios");

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const restaurarPrompt = (): void => {
  promptAtual.value = promptPadrao;
};
</script>

<style scoped>
.generate-btn {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
}
</style>