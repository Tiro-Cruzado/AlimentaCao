// Animal schema in Sanity. This is what the volunteer fills in.
//
// Rule that guided the design: every field that changes the adopter's decision
// is required; the rest is optional. An incomplete profile leads to a wasted
// visit — and a wasted visit discourages volunteer and adopter alike.

export default {
  name: "animal",
  title: "Animal",
  type: "document",
  groups: [
    { name: "main", title: "Principal", default: true },
    { name: "media", title: "Fotos e vídeos" },
    { name: "profile", title: "Perfil e saúde" }
  ],
  fields: [
    { name: "name", title: "Nome", type: "string", group: "main", validation: (r) => r.required() },
    {
      name: "slug", title: "Endereço da página", type: "slug", group: "main",
      description: "Gerado a partir do nome. Evite mudar depois de publicar: links antigos quebram.",
      options: { source: "name", maxLength: 60 }, validation: (r) => r.required()
    },
    {
      name: "species", title: "Espécie", type: "string", group: "main",
      options: { list: [{ title: "Cão", value: "dog" }, { title: "Gato", value: "cat" }, { title: "Outro", value: "other" }], layout: "radio" },
      validation: (r) => r.required()
    },
    {
      name: "speciesOther", title: "Qual animal?", type: "string", group: "main",
      description: "Aparece no site no lugar de \"Outro\". Ex.: Cavalo, Coelho, Calopsita.",
      hidden: ({ document }) => document?.species !== "other"
    },
    {
      name: "size", title: "Porte", type: "string", group: "main",
      options: {
        list: [
          { title: "Pequeno (até 10 kg)", value: "small" },
          { title: "Médio (10 a 25 kg)", value: "medium" },
          { title: "Grande (acima de 25 kg)", value: "large" }
        ], layout: "radio"
      },
      validation: (r) => r.required()
    },
    { name: "sex", title: "Sexo", type: "string", group: "main", options: { list: ["Macho", "Fêmea"], layout: "radio" }, validation: (r) => r.required() },
    {
      name: "age", title: "Idade aproximada", type: "string", group: "main",
      description: 'Como você diria em voz alta: "3 anos", "8 meses".', validation: (r) => r.required()
    },
    {
      name: "status", title: "Situação", type: "string", group: "main", initialValue: "available",
      options: {
        list: [
          { title: "Esperando um lar", value: "available" },
          { title: "Em processo de adoção", value: "in_process" },
          { title: "Em tratamento veterinário", value: "in_treatment" },
          { title: "Adotado", value: "adopted" }
        ]
      },
      validation: (r) => r.required()
    },
    {
      name: "rescueDate", title: "Data do resgate", type: "date", group: "main",
      description: 'O site calcula "esperando há 1 ano e 3 meses" a partir daqui. É o número que mais move quem está em dúvida.',
      validation: (r) => r.required()
    },
    {
      name: "adoptionDate", title: "Data da adoção", type: "date", group: "main",
      description: 'Preencha junto com a situação "Adotado". Faz o tempo parar na adoção em vez de contar até hoje.',
      hidden: ({ document }) => document?.status !== "adopted"
    },
    {
      name: "urgent", title: "Cuidado urgente", type: "boolean", group: "main", initialValue: false,
      description: "Use com parcimônia. Se tudo é urgente, nada é."
    },
    { name: "location", title: "Onde está", type: "string", group: "main", description: 'Ex: "Lar temporário, zona sul".' },
    {
      name: "summary", title: "Resumo", type: "text", rows: 2, group: "main",
      description: "Uma ou duas frases, aparecem no card da galeria. Conte o que torna este animal ele mesmo.",
      validation: (r) => r.required().max(200)
    },
    {
      name: "story", title: "História", type: "text", rows: 12, group: "main",
      description: "Deixe uma linha em branco entre os parágrafos. História concreta converte muito mais que apelo genérico.",
      validation: (r) => r.required()
    },
    {
      name: "media", title: "Fotos e vídeos", type: "array", group: "media",
      description: "A primeira foto é a que aparece na galeria. Escolha a que mostra o olhar do animal. Fotos marcadas como sensíveis são puladas na hora de escolher a capa.",
      of: [
        {
          type: "image", name: "photo", title: "Foto", options: { hotspot: true },
          fields: [
            {
              name: "alt", title: "Descrição da foto", type: "string",
              description: "Para quem usa leitor de tela e para o Google. Ex: 'Feijão deitado no tapete da sala'.",
              validation: (r) => r.required()
            },
            { name: "caption", title: "Legenda", type: "string" },
            {
              name: "sensitive", title: "Conteúdo sensível", type: "boolean", initialValue: false,
              description: "Marque se mostra ferimento, sangue, cirurgia ou sinais de maus-tratos. No site, aparece desfocado até a pessoa clicar em \"Exibir conteúdo sensível\", e nunca vira a foto de capa."
            }
          ]
        },
        {
          type: "file", name: "video", title: "Vídeo", options: { accept: "video/mp4" },
          fields: [
            { name: "alt", title: "Descrição do vídeo", type: "string", validation: (r) => r.required() },
            { name: "caption", title: "Legenda", type: "string" },
            { name: "poster", title: "Imagem de capa", type: "image", description: "Sem capa, o vídeo fica preto até carregar." },
            {
              name: "sensitive", title: "Conteúdo sensível", type: "boolean", initialValue: false,
              description: "Marque se mostra ferimento, sangue, cirurgia ou sinais de maus-tratos. No site, aparece desfocado até a pessoa clicar em \"Exibir conteúdo sensível\", e nunca vira a foto de capa."
            }
          ]
        }
      ]
    },
    {
      name: "temperament", title: "Temperamento", type: "array", group: "profile",
      of: [{ type: "string" }], options: { layout: "tags" },
      description: 'Ex: "Sociável", "Calmo dentro de casa", "Aprende rápido".'
    },
    {
      name: "health", title: "Saúde", type: "object", group: "profile", options: { columns: 3 },
      fields: [
        { name: "neutered", title: "Castrado", type: "boolean", initialValue: false },
        { name: "vaccinated", title: "Vacinado", type: "boolean", initialValue: false },
        { name: "dewormed", title: "Vermifugado", type: "boolean", initialValue: false },
        {
          name: "notes", title: "Observações", type: "text", rows: 3,
          description: "Condição crônica, medicação, restrição. Ex: FIV+, artrose, usar peitoral em vez de coleira. Dizer isso aqui evita devolução depois."
        }
      ]
    },
    {
      name: "goodWith", title: "Convive bem com", type: "object", group: "profile",
      description: 'Se não foi testado, marque "Não testado". Dizer "sim" sem ter certeza é a causa número um de devolução.',
      options: { columns: 3 },
      fields: ["children", "dogs", "cats"].map((field) => ({
        name: field,
        title: { children: "Crianças", dogs: "Cães", cats: "Gatos" }[field],
        type: "string", initialValue: "untested",
        options: {
          list: [
            { title: "Sim", value: "yes" },
            { title: "Não", value: "no" },
            { title: "Não testado", value: "untested" }
          ]
        }
      }))
    }
  ],
  orderings: [
    { title: "Esperando há mais tempo", name: "longestWaiting", by: [{ field: "rescueDate", direction: "asc" }] },
    { title: "Chegou mais recentemente", name: "mostRecent", by: [{ field: "rescueDate", direction: "desc" }] }
  ],
  preview: { select: { title: "name", subtitle: "status", media: "media.0" } }
};
