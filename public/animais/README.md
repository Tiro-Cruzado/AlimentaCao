# Animal photos and videos

Only use this folder while Sanity is not connected. After that, media goes
through the admin panel and the CDN takes care of size and format.

- Photo: `/animais/feijao-1.jpg` → `{ type: "image", src: "/animais/feijao-1.jpg", alt: "..." }`
- Video: `/animais/feijao.mp4` → `{ type: "video", src: "/animais/feijao.mp4", poster: "/animais/feijao-capa.jpg", alt: "..." }`

Practical recommendations:

- Photo: at most 1600px on the longer side and 300 KB per file. An untouched
  phone photo is 4 MB and takes a long time to open on 3G, which is how most
  people will see the site.
- Video: .mp4 (H.264), at most 30 seconds and 5 MB. Always with a `poster`,
  otherwise the card stays black until the video loads.
- Photo or video that shows an injury, blood, surgery or abuse: add
  `sensitive: true`. It is shown blurred on the animal's page, with the
  "Exibir conteúdo sensível" button, and never becomes the cover photo.
- `alt` is required on every photo: it describes the image for screen-reader
  users and it is what Google reads. Write it in Portuguese, like the rest of
  the content.
