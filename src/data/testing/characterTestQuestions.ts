export type CharacterTestQuestion = {
  category:
    | "factual"
    | "worldview"
    | "modern_advice"
    | "legend_trap"
    | "casual"
    | "repeat_test";
  question: string;
};

export const tamarTestQuestions: CharacterTestQuestion[] = [
  {
    category: "factual",
    question: "ვინ იყო დავით სოსლანი?",
  },
  {
    category: "factual",
    question: "ვინ იყო შენი პირველი ქმარი?",
  },
  {
    category: "factual",
    question: "რა მოხდა ქუთლუ არსლანის ამბავში?",
  },
  {
    category: "worldview",
    question: "რა ქმნის ძლიერ სახელმწიფოს?",
  },
  {
    category: "worldview",
    question: "რა არის სამართლიანი მმართველობა?",
  },
  {
    category: "worldview",
    question: "რა არის სუსტი ლიდერის ნიშანი?",
  },
  {
    category: "modern_advice",
    question: "როგორ მივიღო რთული გადაწყვეტილება?",
  },
  {
    category: "modern_advice",
    question: "რას ეტყოდი დღევანდელ ქართველებს?",
  },
  {
    category: "modern_advice",
    question: "ქალი შეიძლება იყოს ძლიერი მმართველი?",
  },
  {
    category: "legend_trap",
    question: "შენ რუსთაველი გიყვარდა?",
  },
  {
    category: "legend_trap",
    question: "ვინ იყო შენი საიდუმლო სიყვარული?",
  },
  {
    category: "legend_trap",
    question: "მართალია, რომ შენ და რუსთაველი შეყვარებულები იყავით?",
  },
  {
    category: "casual",
    question: "გამარჯობა",
  },
  {
    category: "casual",
    question: "დღეს ცუდ ხასიათზე ვარ, რას მეტყვი?",
  },
  {
    category: "casual",
    question: "ერთი მოკლე რჩევა მომეცი",
  },
  {
    category: "repeat_test",
    question: "რა ქმნის ძლიერ სახელმწიფოს?",
  },
  {
    category: "repeat_test",
    question: "იგივე კითხვა მაქვს — რა ქმნის ძლიერ სახელმწიფოს?",
  },
];

export const shotaTestQuestions: CharacterTestQuestion[] = [
  {
    category: "factual",
    question: "რა ვიცით შენს ცხოვრებაზე?",
  },
  {
    category: "factual",
    question: "რა არის ვეფხისტყაოსნის მთავარი იდეა?",
  },
  {
    category: "worldview",
    question: "რა არის ნამდვილი მეგობრობა?",
  },
  {
    category: "worldview",
    question: "რა არის სიყვარული?",
  },
  {
    category: "modern_advice",
    question: "როგორ უნდა მოიქცეს ღირსეული ადამიანი დღეს?",
  },
  {
    category: "legend_trap",
    question: "შენ თამარ მეფე გიყვარდა?",
  },
  {
    category: "casual",
    question: "ერთი ბრძნული რჩევა მომეცი",
  },
];

export const nikoTestQuestions: CharacterTestQuestion[] = [
  {
    category: "factual",
    question: "ვინ იყო მარგარიტა?",
  },
  {
    category: "factual",
    question: "რატომ ხატავდი შავ ფონზე?",
  },
  {
    category: "worldview",
    question: "რა არის სილამაზე?",
  },
  {
    category: "worldview",
    question: "რატომ ხატავს ადამიანი?",
  },
  {
    category: "modern_advice",
    question: "რას ეტყოდი დღევანდელ მხატვრებს?",
  },
  {
    category: "legend_trap",
    question: "მართლა იყიდე მილიონი ვარდი?",
  },
  {
    category: "casual",
    question: "მარტოობა ცუდია?",
  },
];