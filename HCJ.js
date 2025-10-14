// hcj.js - Biblioteca HCJ.Js estilo Three.js
const HCJ = {};

// ======== ChatBot ========
HCJ.ChatBot = class {
  constructor(nome = "HCJ", respostas = {}, api = null) {
    this.nome = nome;
    this.respostas = respostas;  // respostas locais
    this.api = api;              // URL da API opcional
    this.comandos = {};          // comandos personalizados
  }

  // Aprender nova resposta
  aprender(pergunta, resposta) {
    this.respostas[pergunta.toLowerCase()] = resposta;
  }

  // Adicionar comando personalizado
  adicionarComando(nome, funcao) {
    this.comandos[nome.toLowerCase()] = funcao;
  }

  // Executar comando personalizado
  async executarComando(nome, ...args) {
    const cmd = this.comandos[nome.toLowerCase()];
    if (cmd) return await cmd(...args);
    return `Comando "${nome}" não encontrado 😅`;
  }

  // Responder mensagem
  async responder(texto) {
    const input = texto.toLowerCase();

    // Se for comando personalizado
    if (input.startsWith("/")) {
      const partes = input.slice(1).split(" ");
      const cmd = partes[0];
      const args = partes.slice(1);
      return await this.executarComando(cmd, ...args);
    }

    // Se tiver API configurada, tenta usar
    if (this.api) {
      try {
        const resposta = await fetch(this.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensagem: texto })
        });
        const dados = await resposta.json();
        return dados.resposta || this.responderLocal(texto);
      } catch (erro) {
        console.error("Erro na API:", erro);
        return this.responderLocal(texto);
      }
    }

    // Resposta local
    return this.responderLocal(texto);
  }

  // Responder local offline
  responderLocal(texto) {
    return this.respostas[texto.toLowerCase()] || `🤖 ${this.nome}: Não entendi "${texto}" 😅`;
  }

  // Listar todo o conhecimento
  listarConhecimento() {
    return Object.keys(this.respostas);
  }

  // Listar comandos personalizados
  listarComandos() {
    return Object.keys(this.comandos);
  }
};

// ======== Exemplo de uso ========
const bot = new HCJ.ChatBot("ShadowBot", {
  "oi": "Oi! 👋 Tudo bem?",
  "quem é você": "Sou o ShadowBot, criado pelo Ryo 😎"
});

// Adicionar comando personalizado
bot.adicionarComando("hora", () => `🕒 Agora são ${new Date().toLocaleTimeString()}`);
bot.adicionarComando("soma", (a, b) => `Resultado: ${Number(a)+Number(b)}`);

// Usar bot
(async () => {
  console.log(await bot.responder("oi"));
  console.log(await bot.responder("/hora"));
  console.log(await bot.responder("/soma 5 7"));
  console.log(await bot.responder("quem é você"));
})();
