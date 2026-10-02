// The NGO's social networks. The @ shows up on the wall ("Siga @... no Instagram") and in the footer.

export const INSTAGRAM = {
  // Without the @. Leave empty to hide the links.
  username: "projetoalimentacao.assis",

  // NOT IN USE since 01/10/2026: the section of embedded posts was replaced by
  // the wall (photo clothesline). The old component is in
  // src/_archived/InstagramSection.jsx. The list stays here in case they want it back.
  //
  // Posts that used to show up embedded in the page.
  //
  // How to get the link: open the post on Instagram → "..." button →
  // "Copiar link". Paste it here inside the quotes. That is all — no need for
  // a developer account, a key, or paying anything.
  //
  // Works with posts and reels from a PUBLIC profile.
  // Does not work with stories or with a private profile.
  //
  // Example:
  //   posts: [
  //     "https://www.instagram.com/p/DAbCdEfGhIj/",
  //     "https://www.instagram.com/reel/DAbCdEfGhIj/"
  //   ]
  posts: [
    "https://www.instagram.com/p/C9Qg-cgvQ90/",
    "https://www.instagram.com/p/CsH8BRMgHWB/",
    "https://www.instagram.com/p/CoGvZWMAiC3/",
    "https://www.instagram.com/p/Ccl4XuHLOB0/",
    "https://www.instagram.com/p/CU_gskENTmr/",
    "https://www.instagram.com/p/CN5vcfuH1AQ/"
  ],

  // false: the posts stay behind a "Carregar as publicações" button.
  //        The Instagram script (which brings Meta tracking along) is only
  //        downloaded if the person clicks. It is the lightest option and the
  //        most aligned with the LGPD (Brazilian data protection law).
  //
  // true:  the posts load together with the page. More direct for the
  //        visitor, but Meta tracking comes in without them asking, and the
  //        page gets heavier.
  autoLoad: false
};

export const hasInstagram = Boolean(INSTAGRAM.username);
export const instagramProfile = INSTAGRAM.username
  ? `https://www.instagram.com/${INSTAGRAM.username}/`
  : "";
