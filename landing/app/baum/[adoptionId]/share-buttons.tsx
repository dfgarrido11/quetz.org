"use client";

interface ShareButtonsProps {
  url: string;
  treeName: string;
  lang: string;
}

const i18n = {
  de: {
    share: "Teilen",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "E-Mail",
    message: (name: string) => `Ich habe soeben einen ${name} in Guatemala adoptiert! 🌳 Schau dir meinen Baum an:`,
    subject: (name: string) => `Mein ${name} in Zacapa, Guatemala 🌳`,
    body: (name: string, url: string) => `Hallo!\n\nIch habe einen ${name} adoptiert und einen Teil der Erde ein bisschen grüner gemacht.\n\nSchau dir meinen Baum an:\n${url}\n\nMit grünen Grüßen`,
  },
  en: {
    share: "Share",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "Email",
    message: (name: string) => `I just adopted a ${name} in Guatemala! 🌳 See my tree:`,
    subject: (name: string) => `My ${name} in Zacapa, Guatemala 🌳`,
    body: (name: string, url: string) => `Hi!\n\nI adopted a ${name} and made a small part of the planet greener.\n\nSee my tree:\n${url}\n\nWith green greetings`,
  },
  fr: {
    share: "Partager",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "E-mail",
    message: (name: string) => `Je viens d'adopter un ${name} au Guatemala ! 🌳 Voir mon arbre :`,
    subject: (name: string) => `Mon ${name} à Zacapa, Guatemala 🌳`,
    body: (name: string, url: string) => `Bonjour !\n\nJ'ai adopté un ${name} et rendu une petite partie de la planète plus verte.\n\nVoir mon arbre :\n${url}\n\nCordialement`,
  },
  es: {
    share: "Compartir",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
    email: "Email",
    message: (name: string) => `¡Acabo de adoptar un ${name} en Guatemala! 🌳 Mira mi árbol:`,
    subject: (name: string) => `Mi ${name} en Zacapa, Guatemala 🌳`,
    body: (name: string, url: string) => `¡Hola!\n\nAdopté un ${name} y hice un pequeño rincón del planeta más verde.\n\nMira mi árbol:\n${url}\n\nCon cariño verde`,
  },
};

export function ShareButtons({ url, treeName, lang }: ShareButtonsProps) {
  const l = lang in i18n ? lang as keyof typeof i18n : "de";
  const t = i18n[l];

  const encodedUrl = encodeURIComponent(url);
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const whatsappMsg = encodeURIComponent(`${t.message(treeName)} ${url}`);
  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(t.subject(treeName))}&body=${encodeURIComponent(t.body(treeName, url))}`;

  const btnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "50px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.2s",
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer"
        style={{ ...btnStyle, backgroundColor: "#0A66C2", color: "#fff" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
        style={{ ...btnStyle, backgroundColor: "#25D366", color: "#fff" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>

      <a href={mailtoUrl}
        style={{ ...btnStyle, backgroundColor: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        {t.email}
      </a>
    </div>
  );
}
