<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Relatórios Gerados
      </v-card-title>

      <v-divider />

      <v-list>
        <v-list-item
          v-for="relatorio in relatorios"
          :key="relatorio.id"
        >
          <template #prepend>
            <v-avatar color="primary" size="40">
              {{ relatorio.nome.charAt(0) }}
            </v-avatar>
          </template>

          <v-list-item-title>
            {{ relatorio.nome }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ relatorio.data }}
          </v-list-item-subtitle>

          <template #append>
            <v-chip
              :color="relatorio.status === 'gerado' ? 'success' : 'error'"
              size="small"
              class="mr-2"
            >
              {{ relatorio.status }}
            </v-chip>

            <v-btn
              size="small"
              color="primary"
              @click="abrirRelatorio(relatorio)"
            >
              Visualizar
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>


    <v-card-actions class="d-flex justify-space-between">
        <v-btn
            variant="outlined"
            color="secondary"
            @click="voltar"
        >
            Voltar
        </v-btn>

        <v-btn
            color="primary"
            @click="gerarPDF"
        >
            Gerar PDF
        </v-btn>

    </v-card-actions>

    <!-- MODAL TO COPY TEXT-->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          {{ relatorioSelecionado?.nome }}
          <v-btn icon @click="dialog = false">
            ✕
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="relatorio-texto">
            <!--   <pre>{{ relatorioSelecionado?.relatorio }}</pre> -->
            <div
                class="relatorio-texto"
                v-html="renderMarkdown(relatorioSelecionado?.relatorio || '')"
            />
        </v-card-text>


        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <v-btn
            variant="text"
            @click="copiarRelatorio"
          >
            Copiar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- MODAL TO EXIT SCREEN -->
    <v-dialog v-model="dialogConfirmarSaida" max-width="400">
        <v-card>

            <v-card-title>
            Sair sem gerar PDF?
            </v-card-title>

            <v-card-text>
            Os relatórios serão perdidos se você voltar sem gerar o PDF.
            Deseja continuar?
            </v-card-text>

            <v-card-actions class="justify-end">

            <v-btn
                variant="text"
                @click="dialogConfirmarSaida = false"
            >
                Cancelar
            </v-btn>

            <v-btn
                color="error"
                @click="confirmarSaida"
            >
                Sim, sair
            </v-btn>

            </v-card-actions>

        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";
import { marked } from "marked";

import { jsPDF } from "jspdf";
import { useRouter } from "vue-router";

interface Relatorio {
  id: number;
  nome: string;
  data: string;
  status: "gerado" | "erro";
  relatorio: string;
}

const router = useRouter();
const pdfGerado = ref(false);
const dialogConfirmarSaida = ref(false);
const dialog = ref(false);
const relatorioSelecionado = ref<Relatorio | null>(null);
const relatorios = ref<Relatorio[]>([]);

const renderMarkdown = (texto: string) => {
  return marked.parse(texto);
};

const markdownParaTexto = (markdown: string) => {
  const html = marked.parse(markdown);
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.innerText;
};

const abrirRelatorio = (relatorio: Relatorio) => {
  relatorioSelecionado.value = relatorio;
  dialog.value = true;
};

const gerarDataArquivo = () => {
  const agora = new Date();

  const data = agora.toISOString().split("T")[0]; 
  const hora = agora.getHours().toString().padStart(2, "0");
  const minuto = agora.getMinutes().toString().padStart(2, "0");

  return `${data}_${hora}-${minuto}`;
};

const copiarRelatorio = async () => {
  if (!relatorioSelecionado.value) return;

  const html = renderMarkdown(relatorioSelecionado.value.relatorio);
  const text = relatorioSelecionado.value.relatorio;

  const blobHtml = new Blob([html], { type: "text/html" });
  const blobText = new Blob([text], { type: "text/plain" });

  const data = [
    new ClipboardItem({
      "text/html": blobHtml,
      "text/plain": blobText,
    }),
  ];

  await navigator.clipboard.write(data);
};

const gerarPDF = () => {
  const doc = new jsPDF();

  const pageHeight = doc.internal.pageSize.height;
  const margin = 10;
  let y = 20;

  relatorios.value.forEach((r, index) => {

    const textoLimpo = markdownParaTexto(r.relatorio);

    doc.setFontSize(16);
    doc.text(`Paciente: ${r.nome}`, margin, y);

    y += 10;

    doc.setFontSize(11);

    const linhas = doc.splitTextToSize(textoLimpo, 180);

    linhas.forEach((linha: string) => {

      if (y > pageHeight - 10) {
        doc.addPage();
        y = 20;
      }

      doc.text(linha, margin, y);
      y += 6;

    });

    y += 10;

    if (index < relatorios.value.length - 1) {
      doc.addPage();
      y = 20;
    }

  });

  const fileName = `relatorios_${gerarDataArquivo()}.pdf`;
  doc.save(fileName);
  pdfGerado.value = true;
};


const limparRelatorios = () => {
  localStorage.removeItem("relatorios");
  router.push("/");
};

const voltar = () => {
  if (!pdfGerado.value) {
    dialogConfirmarSaida.value = true;
    return;
  }

  limparRelatorios();
};

const confirmarSaida = () => {
  dialogConfirmarSaida.value = false;
  limparRelatorios();
};

onMounted(() => {
  const data = localStorage.getItem("relatorios");
  if (data) relatorios.value = JSON.parse(data);
});

</script>

<style scoped>
.relatorio-texto {
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.relatorio-texto {
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.relatorio-texto h1,
.relatorio-texto h2,
.relatorio-texto h3 {
  margin-top: 16px;
}

.relatorio-texto ul {
  padding-left: 20px;
}

.relatorio-texto hr {
  margin: 20px 0;
}
</style>