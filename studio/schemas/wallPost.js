// Wall post: events, completed adoptions, rescues, behind the scenes.
// Each post is an "album": a title, a date and one or more photos or
// videos. On the site, it shows up on the /mural page (and the latest on the home).

const SENSITIVE = {
  name: "sensitive", title: "Conteúdo sensível", type: "boolean", initialValue: false,
  description: "Marque se mostra ferimento, sangue, cirurgia ou sinais de maus-tratos. No site, aparece desfocado até a pessoa clicar em \"Exibir conteúdo sensível\", e nunca vira a foto de capa."
};

export default {
  name: "wallPost",
  title: "Mural",
  type: "document",
  fields: [
    {
      name: "title", title: "Título", type: "string",
      description: 'Curto e concreto. Ex.: "Feira de adoção no Parque da Água Branca", "Feijão foi para casa".',
      validation: (r) => r.required().max(80)
    },
    {
      name: "date", title: "Data", type: "date",
      description: "Quando aconteceu. O mural mostra do mais recente para o mais antigo.",
      validation: (r) => r.required()
    },
    {
      name: "category", title: "Categoria", type: "string", initialValue: "event",
      options: {
        list: [
          { title: "Evento", value: "event" },
          { title: "Adoção", value: "adoption" },
          { title: "Resgate", value: "rescue" },
          { title: "Bastidores", value: "behind_the_scenes" }
        ],
        layout: "radio"
      },
      validation: (r) => r.required()
    },
    {
      name: "text", title: "Texto", type: "text", rows: 3,
      description: "Opcional. Uma ou duas frases sobre o que aconteceu.",
      validation: (r) => r.max(300)
    },
    {
      name: "animals", title: "Animais que aparecem", type: "array",
      description: "Opcional. Cria um link para a página de cada um.",
      of: [{ type: "reference", to: [{ type: "animal" }] }]
    },
    {
      name: "media", title: "Fotos e vídeos", type: "array",
      description: "A primeira foto não sensível vira a capa da publicação.",
      validation: (r) => r.required().min(1),
      of: [
        {
          type: "image", name: "photo", title: "Foto", options: { hotspot: true },
          fields: [
            {
              name: "alt", title: "Descrição da foto", type: "string",
              description: "Para quem usa leitor de tela e para o Google. Ex.: 'Voluntárias com três filhotes no colo, na feira'.",
              validation: (r) => r.required()
            },
            { name: "caption", title: "Legenda", type: "string" },
            SENSITIVE
          ]
        },
        {
          type: "file", name: "video", title: "Vídeo", options: { accept: "video/mp4" },
          fields: [
            { name: "alt", title: "Descrição do vídeo", type: "string", validation: (r) => r.required() },
            { name: "caption", title: "Legenda", type: "string" },
            { name: "poster", title: "Imagem de capa", type: "image", description: "Sem capa, o vídeo fica preto até carregar." },
            SENSITIVE
          ]
        }
      ]
    }
  ],
  orderings: [{ title: "Mais recentes", name: "mostRecent", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { title: "title", date: "date", category: "category", media: "media.0" },
    prepare: ({ title, date, category, media }) => ({
      title,
      subtitle: [{ event: "Evento", adoption: "Adoção", rescue: "Resgate", behind_the_scenes: "Bastidores" }[category], date].filter(Boolean).join(" · "),
      media
    })
  }
};
