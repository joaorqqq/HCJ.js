// ===== HCJ.js - Single file version =====
const HCJ = {};

// ===================== HCJ Core =====================
HCJ.ChatBot = class {
  constructor(nome, respostas = {}, modules = {}) {
    this.nome = nome || "HCJ";
    this.respostas = respostas;
    this.comandos = {};
    this.modules = modules;
  }

  aprender(pergunta, resposta) {
    this.respostas[pergunta.toLowerCase()] = resposta;
  }

  addCommand(nome, func) {
    this.comandos[nome.toLowerCase()] = func;
  }

  async executarComando(nome, ...args) {
    const cmd = this.comandos[nome.toLowerCase()];
    if (cmd) return await cmd(...args);
    return `Command "${nome}" not found 😅`;
  }

  async responder(texto) {
    const input = texto.toLowerCase();

    if (input.startsWith("/")) {
      const partes = input.slice(1).split(" ");
      const cmd = partes[0];
      const args = partes.slice(1);
      return await this.executarComando(cmd, ...args);
    }

    if (this.respostas[input]) return this.respostas[input];

    if (this.modules.api) return await this.modules.api(texto);

    return `🤖 ${this.nome}: Não entendi "${texto}" 😅`;
  }
};

// ===================== Comandos =====================
HCJ.defaultCommands = {
  time: { description:"Shows current time", func:()=>`🕒 Current time is ${new Date().toLocaleTimeString()}` },
  date: { description:"Shows current date", func:()=>`📅 Today is ${new Date().toLocaleDateString()}` },
  add: { description:"Adds two numbers", func:(a,b)=>`Result: ${Number(a)+Number(b)}` },
  subtract: { description:"Subtracts two numbers", func:(a,b)=>`Result: ${Number(a)-Number(b)}` },
  multiply: { description:"Multiplies two numbers", func:(a,b)=>`Result: ${Number(a)*Number(b)}` },
  divide: { description:"Divides two numbers", func:(a,b)=>`Result: ${Number(a)/Number(b)}` },
  ping: { description:"Test command", func:()=> "Pong! 🏓" },
  random: { description:"Random 0-100", func:()=> Math.floor(Math.random()*101) },
  quote: { description:"Motivational quote", func:()=> ["Go for it!","You can do it!","Never give up!"][Math.floor(Math.random()*3)] },
  joke: { description:"Random joke", func:()=> ["Why did the chicken cross the road?","I would tell you a joke about pizza but it's too cheesy."][Math.floor(Math.random()*2)] },
  dice: { description:"Roll dice 1-6", func:()=> Math.floor(Math.random()*6)+1 },
  coin: { description:"Flip coin", func:()=> Math.random()<0.5?"Heads":"Tails" },
  greet: { description:"Greet someone", func:(name)=>`Hello, ${name}!` },
  calc: { description:"Simple calculation", func:(expr)=> eval(expr) },
  reverse: { description:"Reverse text", func:(txt)=> txt.split("").reverse().join("") },
  upper: { description:"Uppercase", func:(txt)=> txt.toUpperCase() },
  lower: { description:"Lowercase", func:(txt)=> txt.toLowerCase() },
  length: { description:"Text length", func:(txt)=> txt.length },
  shout: { description:"Shout text", func:(txt)=> txt.toUpperCase()+"!!!" },
  love: { description:"I love someone", func:(name)=> `I love ${name} ❤️` },
  luck: { description:"Random luck 1-100", func:()=> Math.floor(Math.random()*100)+1 },
  color: { description:"Random hex color", func:()=> "#"+Math.floor(Math.random()*16777215).toString(16) },
  sqrt: { description:"Square root", func:(n)=> Math.sqrt(Number(n)) },
  square: { description:"Square number", func:(n)=> Number(n)*Number(n) },
  cube: { description:"Cube number", func:(n)=> Number(n)**3 },
  fib: { description:"Fibonacci nth", func:(n)=> {let a=0,b=1;for(let i=0;i<n;i++){let t=a;a=b;b=t+b;} return b;} },
  fact: { description:"Factorial n", func:(n)=> {let f=1;for(let i=2;i<=n;i++)f*=i;return f;} },
  emoji: { description:"Random emoji", func:()=> ["😀","😎","🤖","🔥"][Math.floor(Math.random()*4)] },
  animal: { description:"Random animal", func:()=> ["Cat","Dog","Lion","Tiger"][Math.floor(Math.random()*4)] },
  planet: { description:"Random planet", func:()=> ["Mercury","Venus","Earth","Mars"][Math.floor(Math.random()*4)] },
  yesno: { description:"Yes or no", func:()=> Math.random()<0.5?"Yes":"No" },
  repeat: { description:"Repeat text n times", func:(txt,n)=> txt.repeat(Number(n)) },
  leet: { description:"Leet speak", func:(txt)=> txt.replace(/a/gi,"4").replace(/e/gi,"3").replace(/i/gi,"1").replace(/o/gi,"0").replace(/s/gi,"5") },
  urlencode: { description:"URL encode", func:(txt)=> encodeURIComponent(txt) },
  urldecode: { description:"URL decode", func:(txt)=> decodeURIComponent(txt) },
  time24: { description:"24h format time", func:()=> new Date().toLocaleTimeString('en-GB') },
  year: { description:"Current year", func:()=> new Date().getFullYear() },
  month: { description:"Current month", func:()=> new Date().getMonth()+1 },
  day: { description:"Current day", func:()=> new Date().getDate() },
  weekday: { description:"Weekday name", func:()=> ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()] },
  greettime: { description:"Greet based on time", func:()=> {let h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good night";} },
  emoji_name: { description:"Return emoji by name", func:(name)=> name==="smile"?"😀":name==="robot"?"🤖":"❓" },
};

// ===================== API Module =====================
HCJ.apiModule = async function(texto){
  if(HCJ.apiKeys && (HCJ.apiKeys.chatgpt||HCJ.apiKeys.gemini)){
    const apiCmd = HCJ.defaultCommands.api || {
      func: async function(...args){
        const texto = args.join(" ");
        if(!HCJ.apiKeys) return "No API configured.";
        if(HCJ.apiKeys.chatgpt){
          try{
            const res = await fetch("https://api.openai.com/v1/chat/completions",{
              method:"POST",
              headers:{"Content-Type":"application/json","Authorization":`Bearer ${HCJ.apiKeys.chatgpt}`},
              body:JSON.stringify({model:"gpt-3.5-turbo",messages:[{role:"user",content:texto}]})
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || "No response from ChatGPT.";
          }catch(e){console.error(e);return "Error connecting to ChatGPT API.";}
        }
        if(HCJ.apiKeys.gemini){
          try{
            const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{
              method:"POST",
              headers:{"x-goog-api-key":HCJ.apiKeys.gemini,"Content-Type":"application/json"},
              body:JSON.stringify({contents:[{parts:[{text:texto}]}]})
            });
            const data = await res.json();
            return data.choices?.[0]?.message?.content || "No response from Gemini.";
          }catch(e){console.error(e);return "Error connecting to Gemini API.";}
        }
        return "No API configured.";
      }
    };
    return await apiCmd.func(texto);
  }
  return "No API configured.";
};
