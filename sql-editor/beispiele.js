// Beispiel-Abfragen für das Auswahlmenü des SQL-Editors (aus den Folien zu Einheit 2).
// gruppe = Überschrift im Menü, titel = Eintrag, sql = Abfrage.
window.DGA_BEISPIELE = [
  { gruppe: 'SELECT', titel: 'Eine Spalte auswählen', sql: 'SELECT CustomerName\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Alle Spalten auswählen', sql: 'SELECT *\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Beispiel 1: Ansprechpersonen', sql: 'SELECT ContactName\nFROM Customers' },
  { gruppe: 'SELECT', titel: 'Beispiel 2: Postleitzahl und Stadt', sql: 'SELECT PostalCode, City\nFROM Customers' },

  { gruppe: 'WHERE', titel: 'Beispiel 1: Produkte über 50', sql: 'SELECT ProductName, Price\nFROM Products\nWHERE Price > 50' },
  { gruppe: 'WHERE', titel: 'Beispiel 2: Preis zwischen 10 und 13 (BETWEEN)', sql: 'SELECT ProductName\nFROM Products\nWHERE Price BETWEEN 10 AND 13' },
  { gruppe: 'WHERE', titel: 'Beispiel 2: alternativ mit >= und <=', sql: 'SELECT ProductName\nFROM Products\nWHERE Price >= 10 AND Price <= 13' },
  { gruppe: 'WHERE', titel: 'Beispiel 3: Kunden aus Deutschland', sql: "SELECT *\nFROM Customers\nWHERE Country = 'Germany'" },
  { gruppe: 'WHERE', titel: 'OR: Kunden aus Deutschland oder Österreich', sql: "SELECT CustomerName, City, Country\nFROM Customers\nWHERE Country = 'Germany' OR Country = 'Austria'" },
  { gruppe: 'WHERE', titel: 'Beispiel 4: Länder auf „land“ (LIKE)', sql: "SELECT *\nFROM Customers\nWHERE Country LIKE '%land'" },
  { gruppe: 'WHERE', titel: 'Beispiel 5: vierstellige Postleitzahl', sql: "SELECT *\nFROM Customers\nWHERE PostalCode LIKE '____'" },

  { gruppe: 'ORDER BY', titel: 'Beispiel 1: Produkte nach Preis', sql: 'SELECT *\nFROM Products\nORDER BY Price ASC' },
  { gruppe: 'ORDER BY', titel: 'Beispiel 2: die 5 teuersten Produkte (TOP)', sql: 'SELECT TOP 5 ProductName, Price\nFROM Products\nORDER BY Price DESC' },
  { gruppe: 'ORDER BY', titel: 'Rückblick: SELECT, WHERE und ORDER BY', sql: 'SELECT ProductName, Price\nFROM Products\nWHERE Price > 20\nORDER BY Price DESC' },

  { gruppe: 'DISTINCT', titel: 'Länder der Kunden ohne Doppelte', sql: 'SELECT DISTINCT Country\nFROM Customers' },

  { gruppe: 'GROUP BY', titel: 'Gruppieren nach Kategorie', sql: 'SELECT CategoryID\nFROM Products\nGROUP BY CategoryID' },
  { gruppe: 'GROUP BY', titel: 'Anzahl Produkte pro Kategorie (COUNT)', sql: 'SELECT CategoryID, COUNT(ProductID)\nFROM Products\nGROUP BY CategoryID' },
  { gruppe: 'GROUP BY', titel: 'Beispiel 1: Durchschnittspreis pro Kategorie (AVG)', sql: 'SELECT CategoryID, AVG(Price)\nFROM Products\nGROUP BY CategoryID' },

  { gruppe: 'JOIN', titel: 'Produkte mit Kategorien (LEFT JOIN)', sql: 'SELECT *\nFROM Products\nLEFT JOIN Categories\n  ON Products.CategoryID = Categories.CategoryID' },
  { gruppe: 'JOIN', titel: 'Beispiel 1: Produkte der Kategorie „Produce“', sql: "SELECT *\nFROM Products\nLEFT JOIN Categories\n  ON Products.CategoryID = Categories.CategoryID\nWHERE CategoryName = 'Produce'" },
  { gruppe: 'JOIN', titel: 'Beispiel 2: Anzahl Produkte pro Kategoriename', sql: 'SELECT CategoryName, COUNT(ProductID) AS ProductIDCount\nFROM Products\nLEFT JOIN Categories\n  ON Products.CategoryID = Categories.CategoryID\nGROUP BY CategoryName' },
  { gruppe: 'JOIN', titel: 'Beispiel 3: Produkte mit Kategorie und Lieferant', sql: 'SELECT *\nFROM Products p\nLEFT JOIN Categories c\n  ON p.CategoryID = c.CategoryID\nLEFT JOIN Suppliers s\n  ON p.SupplierID = s.SupplierID' }
];
