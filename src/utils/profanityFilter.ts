// Daftar kata-kata kasar (bisa ditambahkan sesuai kebutuhan)
const badWords = [
  "anjing",
  "bangsat",
  "bego",
  "bodoh",
  "jancuk",
  "kampret",
  "kontol",
  "memek",
  "ngentot",
  "perek",
  "setan",
  "sialan",
  "tolol",
  // Tambahkan kata-kata lain sesuai kebutuhan
];

// Fungsi untuk menyensor kata
export const censorBadWords = (text: string): string => {
  let censoredText = text.toLowerCase();

  badWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    censoredText = censoredText.replace(regex, "*".repeat(word.length));
  });

  return censoredText;
};

// Fungsi untuk mengecek apakah teks mengandung kata kasar
export const containsBadWords = (text: string): boolean => {
  const lowercaseText = text.toLowerCase();
  return badWords.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lowercaseText);
  });
};
