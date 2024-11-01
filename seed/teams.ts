import { Team, Driver } from "../shared/types";

export const teams: Team[] = [
  {
    teamId: 1,
    name: "Red Bull Racing",
    base: "Milton Keynes, United Kingdom",
    teamPrincipal: "Christian Horner",
    worldChampionships: 6,
    founded: 2005,
    description:
      "A leading F1 team known for its competitive performance and skilled drivers.",
  },
  {
    teamId: 2,
    name: "Mercedes-AMG Petronas Formula One Team",
    base: "Brackley, United Kingdom",
    teamPrincipal: "Toto Wolff",
    worldChampionships: 8,
    founded: 2010,
    description:
      "A dominant force in F1, holding multiple championship titles in recent years.",
  },
  {
    teamId: 3,
    name: "Scuderia Ferrari",
    base: "Maranello, Italy",
    teamPrincipal: "Fred Vasseur",
    worldChampionships: 16,
    founded: 1950,
    description: "One of the oldest and most iconic teams in F1 history.",
  },
  {
    teamId: 4,
    name: "McLaren Racing",
    base: "Woking, United Kingdom",
    teamPrincipal: "Zak Brown",
    worldChampionships: 8,
    founded: 1966,
    description:
      "A British team known for its legacy and innovation in motorsport.",
  },
  {
    teamId: 5,
    name: "Aston Martin Aramco Cognizant Formula One Team",
    base: "Silverstone, United Kingdom",
    teamPrincipal: "Mike Krack",
    worldChampionships: 0,
    founded: 2021,
    description:
      "A recently formed team with ambitions to compete among the best in F1.",
  },
  {
    teamId: 6,
    name: "Alpine F1 Team",
    base: "Enstone, United Kingdom",
    teamPrincipal: "Otmar Szafnauer",
    worldChampionships: 2,
    founded: 1981,
    description: "A rebranded French team with a history in F1 racing.",
  },
];

export const drivers: Driver[] = [
  {
    driverId: 1,
    teamId: 1,
    name: "Max Verstappen",
    nationality: "Dutch",
    dateOfBirth: "1997-09-30",
    championshipsWon: 3,
    carNumber: 33,
    description:
      "A talented driver known for his aggressive racing style and multiple championships.",
  },
  {
    driverId: 2,
    teamId: 1,
    name: "Sergio Pérez",
    nationality: "Mexican",
    dateOfBirth: "1990-01-26",
    championshipsWon: 0,
    carNumber: 11,
    description:
      "A skilled driver from Mexico with a reputation for consistency and strategic racing.",
  },
  {
    driverId: 3,
    teamId: 2,
    name: "Lewis Hamilton",
    nationality: "British",
    dateOfBirth: "1985-01-07",
    championshipsWon: 7,
    carNumber: 44,
    description:
      "One of the most successful drivers in F1 history, known for his record championships.",
  },
  {
    driverId: 4,
    teamId: 2,
    name: "George Russell",
    nationality: "British",
    dateOfBirth: "1998-02-15",
    championshipsWon: 0,
    carNumber: 63,
    description:
      "A rising star in F1 known for his skills and potential for future championships.",
  },
  {
    driverId: 5,
    teamId: 3,
    name: "Charles Leclerc",
    nationality: "Monégasque",
    dateOfBirth: "1997-10-16",
    championshipsWon: 0,
    carNumber: 16,
    description:
      "An accomplished driver from Monaco with impressive performance and potential.",
  },
  {
    driverId: 6,
    teamId: 3,
    name: "Carlos Sainz",
    nationality: "Spanish",
    dateOfBirth: "1994-09-01",
    championshipsWon: 0,
    carNumber: 55,
    description:
      "A skillful Spanish driver known for his strategic approach and consistency.",
  },
  {
    driverId: 7,
    teamId: 4,
    name: "Lando Norris",
    nationality: "British",
    dateOfBirth: "1999-11-13",
    championshipsWon: 0,
    carNumber: 4,
    description:
      "A young, popular driver from the UK with a promising career in F1.",
  },
  {
    driverId: 8,
    teamId: 4,
    name: "Oscar Piastri",
    nationality: "Australian",
    dateOfBirth: "2001-04-06",
    championshipsWon: 0,
    carNumber: 81,
    description:
      "An Australian driver regarded for his talent and competitive spirit.",
  },
  {
    driverId: 9,
    teamId: 5,
    name: "Fernando Alonso",
    nationality: "Spanish",
    dateOfBirth: "1981-07-29",
    championshipsWon: 2,
    carNumber: 14,
    description:
      "A veteran driver with multiple championships and extensive experience in F1.",
  },
  {
    driverId: 10,
    teamId: 5,
    name: "Lance Stroll",
    nationality: "Canadian",
    dateOfBirth: "1998-10-29",
    championshipsWon: 0,
    carNumber: 18,
    description:
      "A Canadian driver with determination and a drive for success in F1.",
  },
  {
    driverId: 11,
    teamId: 6,
    name: "Pierre Gasly",
    nationality: "French",
    dateOfBirth: "1996-02-07",
    championshipsWon: 0,
    carNumber: 10,
    description:
      "A resilient French driver known for his perseverance and passion for racing.",
  },
  {
    driverId: 12,
    teamId: 6,
    name: "Esteban Ocon",
    nationality: "French",
    dateOfBirth: "1996-09-17",
    championshipsWon: 0,
    carNumber: 31,
    description:
      "A talented French driver with a steady rise in the competitive world of F1.",
  },
];
